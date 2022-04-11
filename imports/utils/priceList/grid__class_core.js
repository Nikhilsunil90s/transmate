/* eslint-disable react-hooks/rules-of-hooks */
import { oPath } from "/imports/utils/functions/path";

// functions
import { initializeData } from "./grid_getData";
import { toFilter, getOther, BuildHeaderData } from "./fnPriceListHelpers";
import { parseHeader } from "./grid_parseHeaders";

import { PRICELIST_TEMPLATES } from "/imports/api/_jsonSchemas/enums/priceListTemplates";
import { useTranslation } from "react-i18next";

const debugGrid = require("debug")("price-list:grid");

class PriceListUICore {
  initializePageFilters(activeFilters = {}) {
    let filter = {};
    this.gridrowsKeys = [];
    this.gridrows = [];
    this.gridcolsKeys = [];
    this.gridcols = [];
    this.pageFilters = []; // reset
    this.params = {}; // reset
    const headerData = parseHeader(
      { doc: this.doc, params: this.params },
      this.t
    );

    this.pageFilters = (this.templInfo.page || []).map(filterDef => {
      let f;
      switch (filterDef.field) {
        case "volumeGroupId":
          f = toFilter(
            headerData.getVolumeGroups(),
            activeFilters.volumeGroupId
          );
          break;
        case "laneId":
          f = toFilter(headerData.getLanes(), activeFilters.laneId);
          break;
        case "volumeRangeId":
          f = toFilter(
            headerData.getVolumeRanges(),
            activeFilters.volumeRangeId
          );
          break;
        case "equipmentGroupId":
          f = toFilter(
            headerData.getEquipments(),
            activeFilters.equipmentGroupId
          );
          break;
        case "costId":
          f = toFilter(headerData.getCharges(), activeFilters.costId);
          break;
        default:
          break;
      }
      if (f.key) {
        filter = Object.assign(filter, f.keys);
      }
      return { ...f, field: filterDef.field };
    });
    this.params = filter;
    return filter;
  }

  buildStructure() {
    debugGrid("translation function exists?: %O", !!this.t);
    const { t } = this.t ? this : useTranslation();
    if (!t) throw Error("no translations");
    const headerData = parseHeader(
      {
        doc: this.doc,
        params: this.params
      },
      t
    );

    // check if the structure is empty
    this.empty = headerData.isEmpty();
    if (this.empty) return;

    ["cols", "rows"].forEach(prop => {
      let arrayProp;
      let res;
      const propDef = this.templInfo[prop];
      if (propDef && propDef.length > 0) {
        // 1 loop through the different levels of the definition
        // add them to the object with arrays for child elements
        // build option combinations only!!
        res = propDef.map(cur => {
          switch (cur.field) {
            case "laneId":
              return headerData.getLanes();
            case "volumeRangeId":
              return headerData.getVolumeRanges();
            case "volumeGroupId":
              return headerData.getVolumeGroups();
            case "equipmentGroupId":
              return headerData.getEquipments();
            case "costId":
              return headerData.getCharges();
            case "shipmentId":
              return headerData.getShipments();
            case "multipliers":
              return headerData.getMultipliers();
            case "currency":
              return headerData.getCurrency();

            default: {
              let fieldName;
              switch (cur.field) {
                case "fromCC":
                case "fromZone":
                case "toCC":
                case "toZone":
                case "goods":
                case "equipments": {
                  fieldName = t(`price.list.shipment.${cur.field}`);
                  break;
                }
                case "incoterm":
                case "portOfLoading":
                case "portOfDischarge": {
                  fieldName = t(`price.list.lane.${cur.field}`);
                  break;
                }
                default: {
                  fieldName = t(`price.list.rate.${cur.field}`);
                }
              }
              return [
                {
                  ...cur,
                  type: "string",
                  fieldType: "attr",
                  fieldName
                }
              ];
            }
          }
        });

        arrayProp = new BuildHeaderData(res, propDef)
          .unwind()
          .removeNonCombinations()
          .getAttributeData(); // this fills-out attr fields with data

        this[`grid${prop}Keys`] = arrayProp.getKeys(["keys", "keysUI"]);
        this[`grid${prop}`] = arrayProp.toArray().get();
      }
    });

    // 4 shift the _colum & _row for additional rows/cols
    // after fully loading the column & rows, we add the extra rows/cols to make space for additional rows
    // note: with full licence we can do this in nested headers.
    // [ <top row>
    // <second row> ] -> [[]]
    const corrections = {};
    ["cols", "rows"].forEach(prop => {
      const listProps = this[`grid${prop}`].slice(1);
      if (listProps && listProps.length > 0) {
        corrections[`${getOther(prop)}`] = listProps.map(listProp => {
          return {
            label: oPath([0, "fieldName"], listProp)
          };
        });

        // return corrections[`${getOther(prop)}`];
      }
    });

    ["cols", "rows"].forEach(prop => {
      // [ <corrections ,[.. the rest]]
      this[`grid${prop}`] = this[`grid${prop}`].map((curProp, i) => {
        let corr = corrections[prop] || [];

        // the shifted cells (<> the headers) should be emptied:
        if (i > 0) corr = Array(corr.length).fill({});
        return [].concat(corr, curProp);
      });
      this[`grid${prop}Keys`] = [].concat(
        corrections[prop] || [],
        this[`grid${prop}Keys`]
      );
      return this[`grid${prop}Keys`];
    });
  }

  constructor(doc, client, t) {
    this.client = client;
    this.t = t;
    this.gridrows = [];
    this.gridcols = [];
    this.data = []; // data[row][col]
    this.templInfo = {};
    this.security = {};
    this.doc = doc;
    this.priceListId = doc.id;

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
    debugGrid("grid initialized with template: %s", this.doc.template.type);
  }

  initializeData() {
    this.base = initializeData({
      rowCount: this.gridrowsKeys.length,
      colCount: this.gridcolsKeys.length
    });
    return this.base;
  }

  getCellData({ row, col }) {
    // returns the data under a clicked cell, if -1 -> header
    let data;
    if (col < 0) {
      data = oPath(["gridrows", 0, row], this);
    } else if (row < 0) {
      data = oPath(["gridcols", 0, col], this);
    } else {
      data = oPath(["data", row, col], this);
    }
    debugGrid("data at cell: %o", data);
    return data;
  }
}

export { PriceListUICore };
