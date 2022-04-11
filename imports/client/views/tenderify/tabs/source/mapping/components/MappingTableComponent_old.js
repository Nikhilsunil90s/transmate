/* global Handsontable */
import { oPath } from "/imports/utils/functions/path";

// date picker:
import moment from "moment";
import "numbro";
import "pikaday";
import "pikaday/css/pikaday.css";

import {
  mappingKeys,
  mapBlocks,
  listOptions
} from "/imports/api/_jsonSchemas/fixtures/tenderify-map.json";

import { countryCodes } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/_utilities";

const currencies = require("iso-currencies");

const debug = require("debug")("tenderify:mappingtableold");

const validRenderer = (instance, td, row, col, prop, value, cellProperties) => {
  const { className } = cellProperties;

  while (td.firstChild) {
    td.removeChild(td.firstChild);
  }
  if (typeof value === "boolean") {
    const element = document.createElement("div");
    if (value) {
      element.innerHTML = `<i class="ui blue check circle icon"></i>`;
    } else {
      element.innerHTML = `<i class="ui yellow exclamation triangle icon"></i>`;
    }
    td.appendChild(element);
  } else {
    const textNode = document.createTextNode(value === null ? "" : value);
    td.appendChild(textNode);
  }
  if (className) {
    td.className = className;
  }
  return td;
};

/**
 * Class to render mapping tables for tenderify
 * @param {Object} data - mapping data as [ {} ]
 * @param {Object} colHeaders =
 * @param {String} topic - indicating what we are mapping (mappingParents): ["lanes", "charges", "equipments", "volumes", "goods"]
 * @param {Object} mappingId ObjectId of the mapping document
 * @param {Object} filters
 * @returns class that can exposes draw function that is called in template to render the table
 */
class MappingTable {
  constructor({ data, colHeaders, topic, mappingId, filters }) {
    this.canEdit = true; // todo
    this.mappingData = data || [];
    this.filters = filters || {}; // {key: [values]}
    this.headerRef = colHeaders || [];
    this.topic = topic;
    this.mappingId = mappingId;
    this.columns = [];
    this.colHeaders = [];
    debug({ data, colHeaders, topic, mappingId });

    this.leftCount = this.headerRef.filter(hdrStr =>
      hdrStr.includes(mapBlocks[0])
    ).length;

    // iterate over the headers & set up the column formatting & proper header to show
    this.headerRef.forEach((header, hdrIndex) => {
      if (header === "id" || header === "targetId" || header === "originId")
        return;
      const [lr, key] = header.split("_");
      const col = mappingKeys.find(({ k }) => k === key) || {};

      const curCol = {};

      // data = array index of column
      curCol.data = header;
      curCol.type = "text"; // default

      // format left columns as headers:
      if (lr === mapBlocks[0]) {
        curCol.className = "header";
        curCol.editor = false;
      }

      // render a separator line:
      if (hdrIndex === this.leftCount) {
        curCol.className = "leftBorder";
      }

      // if user can Edit & is target side:
      if (this.canEdit && lr !== mapBlocks[0]) {
        const colType = oPath(["input", "type"], col);

        // uses ajax:
        if (["autocomplete", "handsontable"].includes(colType)) {
          curCol.type = "autocomplete";
          curCol.source = (query, process) => {
            $.ajax({
              url: "/autocomplete",
              contentType: "application/json",
              method: "POST",
              data: JSON.stringify({ query, type: col.input.source }),
              beforeSend(xhr) {
                const token = localStorage.getItem("Meteor.loginToken");
                if (token) {
                  xhr.setRequestHeader("Authorization", `Bearer ${token}`);
                }
              },
              success(response) {

                process(response);
              },
              error(xhr, status, error) {
                console.error(xhr, error);
              }
            });
          };

          if (colType === "autocomplete") {
            curCol.strict =
              col.input.strict === undefined ? true : col.input.strict;
            curCol.allowInvalid = false;
          }
        }

        // predefined list:
        if (oPath(["input", "type"], col) === "list") {
          curCol.type = "dropdown";
          curCol.visibleRows = 4;
          switch (col.input.source) {
            case "currencies":
              curCol.source = Object.keys(currencies.list());
              break;
            case "equipments":
              curCol.source = listOptions.equipments;
              curCol.allowInvalid = true; // otherwise autocomplete + strict = false
              break;
            case "countryCodes":
              curCol.source = countryCodes.sort((a, b) => a.localeCompare(b));
              break;
            case "incoterms":
              curCol.source = [];
              break;
            default:
              curCol.source = listOptions[col.input.source] || [];
          }
        }

        // date picker: (convert string to date)
        if (oPath(["input", "type"], col) === "date") {
          curCol.data = row => {
            const date = moment(row[key], moment.ISO_8601, true);
            if (date.isValid()) {
              return date.format("DD/MM/YYYY");
            }
            return "01/01/2020";
          };
          curCol.type = "date";
          curCol.dateFormat = "DD/MM/YYYY";
          curCol.correctFormat = true;
          curCol.defaultDate = "01/01/2020";

          curCol.datePickerConfig = {
            // First day of the week (0: Sunday, 1: Monday, etc)
            firstDay: 0,
            showWeekNumber: true,
            disableWeekends: true
          };
        }
      } else {
        curCol.readOnly = true;
      }

      if (header === "validated") {
        curCol.renderer = validRenderer;
        curCol.className = "header";
        curCol.editor = false;
        this.columns.unshift(curCol); // to beginning
        this.colHeaders.unshift(header);
      } else {
        this.columns.push(curCol);
        this.colHeaders.push(col.label || key || header);
      }
    });

    // if colheaders need to be sorted -> do this here ....

    debug("data intialized for %s", this.topic);
  }

  draw({ container, afterRender }) {
    debug("container %o, topic: %s", $(container), this.topic);
    const maxWidth = $(container)
      .closest(".segment")
      .width();

    const maxHeight =
      $(container)
        .closest(".segment")
        .height() - 40;

    const { rowHeaderWidth, columnHeaderHeight, width, height } = getSizes(
      this.colHeaders.length || 4,
      this.mappingData.length || 4
    );

    const minWidth = 800;
    const minHeight = 250;

    debug("table sizes: %o", {
      maxWidth,
      minWidth,
      maxHeight,
      minHeight,
      rowHeaderWidth,
      columnHeaderHeight,
      width,
      height
    });

    const self = this;
    this.hot = new Handsontable(container, {
      licenseKey: "non-commercial-and-evaluation",
      data: this.mappingData, // format[[<>,<>]]
      columns: this.columns,
      colHeaders: this.colHeaders,

      // columnHeaderHeight,
      stretchH: "all",

      autoColumnSize: { useHeaders: true },
      width: fitSize(width, maxWidth, minWidth),
      height: fitSize(height, maxHeight, minHeight),
      afterRender(isForced) {
        if (isForced) {
          afterRender();
        }
      },
      afterChange(changes, source) {
        if (["duplicateRow", "loadData"].includes(source)) {
          return;
        }

        let changeCount = 0;
        const mappings = {};
        let hasMappingsToShow = false;
        const updates = [];
        changes.forEach(change => {
          const [row, col, oldValue, newValue] = change;

          // col === index of the original data array (not the rendered)
          if (oldValue !== newValue) {
            const sourceAtRow = this.getSourceDataAtRow(row);
            const prop = col;
            debug("update prop: %o", {
              row,
              col,
              oldValue,
              newValue
            });
            if (!prop) return;
            const propKey = prop.split("_").slice(-1)[0];
            const orgValue = sourceAtRow[`origin_${propKey}`];

            changeCount += 1;
            if (orgValue !== null) {
              const setValue = { o: orgValue, t: newValue };
              mappings[propKey] = [].concat(mappings[propKey] || [], setValue);
            }

            debug("change: %o", {
              row,
              col,
              prop,
              oldValue,
              newValue,
              sourceAtRow: this.getSourceDataAtRow(0)
            });

            // store changes itself:
            updates.push({
              index: row,
              col,
              value: newValue
            });
          }
        });

        // make mappings unique:
        Object.entries(mappings).forEach(([k, mapArray]) => {
          const uniqueMaps = mapArray.filter((item, index) => {
            const curItem = JSON.stringify(item);
            return (
              index ===
              mapArray.findIndex(obj => {
                return JSON.stringify(obj) === curItem;
              })
            );
          });
          mappings[k] = uniqueMaps;
          if (uniqueMaps.length > 0 && !hasMappingsToShow) {
            hasMappingsToShow = true;
          }
        });

        const onSave = ({ mappings: valueMaps }) => {
          debug("user saves mapping %o", {
            mappingId: self.mappingId,
            update: {
              mappingV: {
                key: self.topic,
                updates
              },
              mappingF: valueMaps
            }
          });
          Meteor.call("tenderify.editMapping", {
            mappingId: self.mappingId,
            update: {
              mappingV: {
                key: self.topic,
                updates
              },
              mappingF: valueMaps
            }
          });
        };
        const onCancel = () => {
          // revert change:
          const resetValues = changes.map(([r, prop, v]) => [r, prop, v]);
          debug("user cancels action, reset values: %o", resetValues);
          this.setDataAtRowProp(resetValues);
        };

        if (changeCount > 0) {
          // show modal to the user
          // keep mapping?
          // if yes -> store mapping & apply
          // if no -> revert value back to the preceding value

          if (hasMappingsToShow) {
            // render modal if there are valid mappings to store:
            Blaze.renderWithData(
              Template.TenderifyMappingModal,
              {
                mappings,
                onCancel,
                onSave,

                closable: false
              },
              $(".page.dimmer.modals").get(0)
            );
          } else {
            // save without mappingF:
            onSave({ mappings: undefined });
          }
        }
      },
      contextMenu: {
        items: {
          duplicateRow: {
            name: "Duplicate mapping",
            disabled() {
              // allow for topics [rates] && can edit..
              return !(self.canEdit && ["charges"].includes(self.topic));
            },
            callback(key, selection) {
              // duplicates data of selected row :
              const rowIndex = this.toPhysicalRow(selection[0].start.row);
              const rowData = this.getSourceDataAtRow(rowIndex);

              // visually
              this.alter("insert_row", rowIndex + 1, 1);
              const changes = Object.entries(rowData).map(([k, v]) => [
                rowIndex + 1,
                k,
                v
              ]);
              this.setDataAtRowProp(changes, "duplicateRow"); // source identifier to prevent onChangeCB

              // db
              Meteor.call("tenderify.insertRowMapping", {
                mappingId: self.mappingId,
                topic: self.topic,
                index: rowIndex + 1,
                rowData
              });
            }
          }
        }
      }
    });
  }

  filter({ filters = {} }) {
    let filteredData = this.mappingData;

    // apply all filters:
    Object.entries(filters).forEach(([k, v]) => {
      const colIndex = this.headerRef.indexOf(k);
      if (colIndex > -1) {
        filteredData = filteredData.filter(row => {
          if (
            v === undefined ||
            (Array.isArray(v) && !v.includes(row[colIndex]))
          ) {
            return false;
          }
          return true;
        });
      }
    });

    this.hot.updateSettings({ data: filteredData });
  }
}

export { MappingTable };
