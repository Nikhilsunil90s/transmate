/* global ExcelJS */
import { _ } from "meteor/underscore";
import { buildGridQuery } from "./grid_buildQuery";
import { PriceListExportGenerator } from "./grid__class_export-generator";

import {
  addTabWithData,
  exportGeneralInfo,
  exportHistory,
  exportVolumes,
  exportLanes,
  exportEquipments
} from "./grid_export_structure";
import { saveFile } from "./grid_export_saveToFile";

import { GET_PRICELIST_RATES } from "/imports/client/views/price-list/utils/queries";

const unwind = require("javascript-unwind");
const debug = require("debug");

// 1. load document
// 2 initialize pageFilters
// 3 for Each pageFilter -> run query
// 4 build table(s) -> sheets

class PriceListExport {
  constructor({ priceListDoc, selectedFilters = [] }, client) {
    this.client = client;
    debug("load workbook exceljs");

    // assume  ExcelJS script to be loaded in client
    this.wb = new ExcelJS.Workbook();
    this.doc = priceListDoc;

    Object.assign(this.wb, {
      title: priceListDoc.title,
      subject: "Price list export",
      creator: "Transmate - creating transparent supply chains",
      created: new Date(),
      modified: new Date(),
      Keywords: "Transmate, supply chain, rate management"
    });

    // selectedFilters = [{field:<> , key: <>}]
    // we group these before!
    // we need to check that all filters have a key-> if not-> error?
    this.selectedFilters = _.groupBy(selectedFilters, "field"); // now an object
  }

  addGeneralInfo() {
    addTabWithData.apply(this, [
      {
        tabName: "General",
        data: exportGeneralInfo({ doc: this.doc })
      }
    ]);
    return this;
  }

  addUpdateHistory() {
    const data = exportHistory({ updates: this.doc.updates });
    addTabWithData.apply(this, [
      {
        tabName: "History",
        data
      }
    ]);
    return this;
  }

  addStructureData() {
    ["lanes", "volumes", "equipments"].forEach(topic => {
      if (!this.doc[topic]) {
        return;
      }

      let data;

      switch (topic) {
        case "lanes": {
          const { lanes } = this.doc;
          data = exportLanes({ lanes });
          break;
        }
        case "volumes": {
          const { volumes } = this.doc;
          data = exportVolumes({ volumes });
          break;
        }
        case "equipments": {
          const { equipments } = this.doc;
          data = exportEquipments({ equipments });
          break;
        }
        default:
          data = { sheetData: [["error"]] };
      }

      addTabWithData.apply(this, [
        {
          tabName: topic,
          data
        }
      ]);
    });
    return this;
  }

  prepareFilter() {
    // 1 unwind all options for the filters
    let allCombinations;
    let v;
    const ref = this.selectedFilters;
    Object.keys(ref).forEach(k => {
      v = ref[k];
      if (Array.isArray(v)) {
        allCombinations = unwind(ref, k);
      }
    });

    const allFilterCombinations = [];
    allCombinations.forEach(filter => {
      const pageFilters = [];
      Object.keys(filter).forEach(k => {
        pageFilters.push({
          field: filter[k].field,
          value: filter[k].key
        });
      });
      allFilterCombinations.push(pageFilters); // [ [{}] ]
    });
    this.allCombinations = allFilterCombinations;
    return this;
  }

  async getData() {
    // we will generate n x the gridGeneratorClass with data.

    await Promise.all(
      this.allCombinations.map(pageFilters => {
        return new Promise((resolve, reject) => {
          this.client
            .query({
              query: GET_PRICELIST_RATES,
              variables: {
                priceListId: this.doc.id,
                query: buildGridQuery({
                  pageFilters,
                  params: { mongo: true }
                }),
                inGrid: true
              }
            })
            .then(({ data: resultData }) => {
              // data comes as { rates: [], stats: {} }
              const gridGenerator = new PriceListExportGenerator(
                this.doc,
                pageFilters,
                resultData?.results // { rates: [], stats: {} }
              );

              const data = gridGenerator.get();
              addTabWithData.apply(this, [
                {
                  tabName: data.tabName,
                  data
                }
              ]);
              return resolve();
            })
            .catch(error => reject(error));
        });
      })
    );

    // output file
    const fileName = `Transmate - rate card export.xlsx`;
    saveFile.call(this, { fileName });

    return this; // !this data is async
  }
}

export { PriceListExport };
