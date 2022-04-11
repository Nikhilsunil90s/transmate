/* eslint-disable consistent-return */
import get from "lodash.get";
import { arrayUnique } from "/imports/utils/functions/fnArrayHelpers";

// functions
import { PriceListUIData } from "./grid__class_data";

import { PRICELIST_TEMPLATES } from "/imports/api/_jsonSchemas/enums/priceListTemplates";

import { afterChangeHandler } from "./grid_afterChangeHandler";

const currencies = require("iso-currencies");

const debugGrid = require("debug")("price-list:grid");

export class PriceListComp extends PriceListUIData {
  onRefresh = null;

  constructor({
    client,
    t,
    doc,
    onSaveAction,
    security = {},
    fetchRates,
    mock
  }) {
    super(doc, client);
    this.fetchRates = fetchRates;
    this.onSaveAction = onSaveAction; // for gridStructure NOT rates!
    this.security = security;
    this.mock = mock;
    this.t = t || (k => k); // translation should be passed down

    // constructor options:
    //	1. template name = [ 'road', 'ocean', 'air'] -> lookup from default structure
    //	2. template is an object that holds the structure
    //	3. template is a an object that is the derived structure (no unwinds etc. needed)
    if (this.doc.template.type !== "custom") {
      this.templInfo = PRICELIST_TEMPLATES[this.doc.template.type];
    } else {
      this.templInfo = this.doc.template.structure;
    }
    this.initializePageFilters(); // 0 set original filters
    this.buildStructure(); // 1 set structure based on the
    this.initializeData(); // fils [[]]
  }

  getHeaders(prop, field) {
    // returns array of the specific fieldin the header
    // used to build the header data
    const fields = get(this, [`grid${prop}`, 0], []);
    return fields.map(fieldProp => {
      if (field) return get(fieldProp, [field]);
      return fieldProp.label || fieldProp.value || "";
    });
  }

  /** will determine cell form */
  getColumns() {
    const fields = this.getHeaders("cols", "type");
    return fields.map(() => ({
      type: "currency",
      editor: false,
      ...(this.security.canEdit ||
      this.security.canFillOut ||
      this.security.canEditRateInGrid
        ? {
            editor: "numeric"
          }
        : undefined)
    }));
  }

  getButtons() {
    if (!this.security.canModifyGridStructure) {
      return;
    }
    const data = {
      onSave: this.onSaveAction,
      disable: false
    };

    // returns butons that need to be shown underneath the table
    let btns = [
      ...this.templInfo.rows,
      ...this.templInfo.cols,
      ...this.templInfo.page
    ].reduce((acc, cur) => {
      switch (cur.field) {
        case "laneId":
          acc.push({
            template: "LaneModal",
            text: this.t("price.list.lane.add"),
            data: {
              ...data,
              lanes: this.doc.lanes || []
            }
          });
          break;
        case "costId":
          acc.push({
            template: "PriceListChargeModal",
            text: this.t("price.list.charge.add"),
            data: {
              ...data,
              charges: this.doc.charges || []
            }
          });
          break;
        case "volumeGroupId":
        case "volumeRangeId":
          acc.push({
            template: "VolumeGroupModal",
            text: this.t("price.list.volume.add"),
            data: {
              ...data,
              volumes: this.doc.volumes || []
            }
          });
          break;
        case "equipmentGroupId":
          acc.push({
            template: "EquipmentModal",
            text: this.t("price.list.equipment.add"),
            data: {
              ...data,
              equipments: this.doc.equipments || []
            }
          });
          break;
        default:
          break;
      }
      return acc;
    }, []);

    // remove duplicate buttons
    btns = arrayUnique(btns, "template");

    return btns;
  }

  parseChanges(changes) {
    debugGrid({ changes });
    const updates = changes
      .map(change => {
        return afterChangeHandler({ change, grid: this })
          .checkPermissions()
          .initializeData()
          .checkIfHeader()
          .getUpdate();
      })
      .flat();

    return { priceListId: this.priceListId, updates };
  }

  setCellFormatAndDropdowns() {
    if (!this.base) return;
    return this.base.reduce((rowAcc, row, i) => {
      return row.reduce((colAcc, v, j) => {
        let allowed;

        // security:
        // either canEdit === access to whole template
        // either limited through specific keys
        if (v != null && v.isHeader) {
          const setLockedHeader = () => {
            colAcc.push({
              row: i,
              col: j,
              className: "header",
              type: "text", // if v.type =="string"  only? -> can add extra condition
              editor: false
            });
          };
          if (v.type === "dropdown") {
            const settings = {
              row: i,
              col: j,
              className: "dropdown",
              type: "dropdown",
              allowInvalid: false
            };

            if (
              v.field === "multiplier" &&
              (this.security.canEdit || this.security.canEditMultiplierInGrid)
            ) {
              allowed = get(this, ["doc", "uoms", "allowed"], []);
              debugGrid("allowedValues: %o", allowed);
              colAcc.push({ ...settings, source: ["shipment", ...allowed] });
            } else if (
              v.field === "amount.unit" &&
              (this.security.canEdit || this.security.canEditCurrencyInGrid)
            ) {
              debugGrid("currency: %o", v);
              colAcc.push({
                ...settings,
                source: [...Object.keys(currencies.list())]
              });
            } else {
              setLockedHeader();
            }
          } else {
            setLockedHeader();
          }
        }
        return colAcc;
      }, rowAcc);
    }, []);
  }

  async refresh({ doc, vendor, activeFilters, security }, callback) {
    debugGrid("grid refresh called %o", {
      hasdoc: doc.id,
      hasRefresh: !!this.onRefresh
    });
    this.security = security || this.security;
    debugGrid("security: %O", this.security);

    if (vendor != null) {
      this.vendor = vendor;
    }

    if (doc && doc.id) {
      // rebuild structure in case e.g. lanes are added
      this.doc = doc;
      this.initializePageFilters(activeFilters);
      this.buildStructure();
      this.initializeData();

      await this.getData(callback);
    }

    // eslint-disable-next-line no-unused-expressions
    this.onRefresh && this.onRefresh();

    return { filters: this.pageFilters, empty: this.empty };
  }
}
