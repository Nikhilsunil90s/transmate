import { _ } from "meteor/underscore";
import { dotObject } from "./fnObjectHelpers.js";
import { selectFromMatrix } from "./fnMatrixHelpers.js";
import { intersectList, listFindKey, listFind } from "./fnListHelpers.js";
import { reformatRulesToArray } from "/imports/utils/priceList/fnPriceListHelpers.js";
import { oPath } from "/imports/utils/functions/path.js";

const dot = require("dot-object");

// uses dotObject, selectFromMatrix
export const PopData = class PopData {
  constructor(data) {
    this.data = data;
  }

  select(selection) {
    // select from [[]] a certain portion -> result is a []
    this.data = selectFromMatrix(selection, this.data);
    return this;
  }

  cloneData() {
    this.data = JSON.parse(JSON.stringify(this.data));
    return this;
  }

  filter(key, val) {
    // filter selected data
    this.data = this.data.filter(el => {
      return el && el[key] === val;
    });
    return this;
  }

  filterKey(key = "id") {
    // filter for certain key/field to exist
    this.data = this.data.filter(obj => {
      return oPath([key], obj);
    });
    return this;
  }

  find(selector) {
    this.data = listFind(this.data, selector);
    return this;
  }

  dotObject() {
    this.data = this.data.map(el => {
      return dotObject(el);
    });
    return this;
  }

  getIntersection() {
    this.data = intersectList(this.data);
    return this;
  }

  findKey(key) {
    return listFindKey(this.data, key);
  }

  getCommonData() {
    // ! this may affect the data structure of referenced data! -> use cloneData()
    const data = JSON.parse(JSON.stringify(this.data)).map(el => dotObject(el));

    const res = _.reduce(data, (acc, obj) => {
      Object.keys(obj).forEach(p => {
        if (acc[p] !== obj[p] || acc[p] === undefined) {
          delete acc[p];
        }
      });
      return acc;
    });
    res.rules = reformatRulesToArray(res.rules);
    return dot.object(res);
  }

  getCount() {
    return this.data.length;
  }

  get() {
    return this.data;
  }
};
