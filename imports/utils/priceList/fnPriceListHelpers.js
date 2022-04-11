/* eslint-disable consistent-return */
import get from "lodash.get";
import { _ } from "meteor/underscore";
import {
  findKVInObject,
  findInObject,
  arrayToObject,
  cleanObject
} from "../functions/fnObjectHelpers";
import { distinctList } from "../functions/fnListHelpers";
import {
  incoterms,
  serviceLevels
} from "/imports/api/_jsonSchemas/simple-schemas/_utilities/_units";

const debug = require("debug")("price-list:helper");
const unwind = require("javascript-unwind");

// helper that converts an object of rule keys to 'rules.key' for mongo selection
export const toRules = keys => {
  let v;
  const s = {};
  Object.keys(keys).forEach(k => {
    v = keys[k];
    s[`rules.${k}`] = v;
  });
  return s;
};

export const reformatRulesToArray = obj => {
  // rules are parsed as {}, reformat it to [ {},{} ]
  const newArr = [];
  if (typeof obj === "object") {
    Object.keys(obj).forEach(key => {
      newArr.push({ [key]: obj[key] });
    });
  }
  return newArr;
};

// helper to set the filter options based on the columns
export const toFilter = (arr, activeFilter) => {
  let index;
  const options = arr.map(el => {
    return {
      value: el.key,
      text: el.label
    };
  });
  const found = arr.findIndex(el => {
    return el.key === activeFilter;
  });
  if (found && found > -1) {
    index = found;
  } else {
    index = 0;
  }

  return { ...arr[index], options, value: get(options, [index, "value"]) };
};

// returns the other value for cols/rows
export const getOther = prop => {
  switch (prop) {
    case "cols":
      return "rows";
    case "rows":
      return "cols";
    case "col":
      return "row";
    case "row":
      return "col";
    default:
      break;
  }
};

// formats  data ranges:
export const rangeFormatter = (fromR, toR) => {
  let formattedFromR = Math.round(fromR, 1);
  let formattedToR = Math.round(toR, 1);
  let suffix = "";
  if (toR > 1000) {
    formattedToR = Math.round(toR / 1000, 1);
    suffix = " k";
  }
  if (toR > 1000 && fromR > 1000) {
    formattedFromR = Math.round(fromR / 1000, 1);
  }

  if (!toR) {
    return `${formattedFromR}`;
  }
  return `${formattedFromR} - ${formattedToR}${suffix}`;
};

/** helper class to fill in value of header cells */
export const BuildHeaderData = class BuildHeaderData {
  constructor(data, propDef) {
    // propdef = templInfo.row or col definition
    // data is the list of combinations as [[<field A opts> ],[<field B opts> ],...]
    this.propDef = propDef;
    this.data = arrayToObject(data);
  }

  unwind() {
    let v;
    const ref = this.data;

    // 2. unwind all possibilities (input is object!!)
    // output is: [{'0': {...},'1':{...}}]
    Object.keys(ref).forEach(k => {
      v = ref[k];
      if (Array.isArray(v)) {
        debug("BuildHeaderData %o, key  %o", this.data, k);
        this.data = unwind(this.data, k);
      }
    });
    return this;
  }

  removeNonCombinations() {
    // step 1 -> look for fields that can contradict ( such as multiplier and rangeId )
    // action: remove field attributes and make generic -> then filter out duplicates
    this.data.forEach((prop, i) => {
      let v;
      const results = [];
      Object.keys(prop).forEach(k => {
        v = prop[k];
        const found = findKVInObject(prop, {
          field: "volumeRangeId"
        });

        // case: charge> multiplier is shipment and we have vol range unwound
        if (v.field === "charge" && v.multiplier === "shipment") {
          const { value, key } = found || {};
          if (found && value && key) {
            prop[key] = {
              field: "volumeRange",
              fieldName: findInObject(value, "fieldName"),
              keys: {
                volumeGroupId: findInObject(value, "volumeGroupId")
              },
              text: "-"
            };
            results.push((this.data[i] = prop));
          } else {
            results.push(undefined);
          }
        } else {
          results.push(undefined);
        }
      });

      return results;
    });

    // other cases here ....
    this.data = distinctList(this.data);
    return this;
  }

  /** function that will look for values for attribute cells.
   * example: currency cell will look in the props to see if there is a currency value defined and set the value
   */
  getAttributeData() {
    const { data } = this;
    if (data) {
      data.map(prop => {
        // prop = {'0':{...},'1'"{...}",'2':{...},...}
        Object.keys(prop).forEach(k => {
          // k = '0', '1', '2', ...
          let val;
          const v = prop[k]; // {'field':..., 'label';...}

          let fieldName = get(v, ["field"]) || "";

          // in charges [], currency is root key, in a rate item, currency is 'amount.unit'
          fieldName = fieldName === "amount.unit" ? "currency" : fieldName;

          if (v.fieldType === "attr" && fieldName) {
            val = fieldName
              .split("/")
              .map(f => {
                // look in the prop {} to see if the field value is there.
                return findInObject(prop, f) || "-";
              })
              .join("/");

            prop[k] = {
              ...v,
              ...(val !== "-" ? { value: val } : undefined)
            };
            return prop[k];
          }
        });
        return prop;
      });
    }
    return this;
  }

  toArray() {
    const arrayProp = [];
    Object.keys(this.propDef).forEach(k => {
      arrayProp[k] = Array.from(this.data, val => {
        return val[k];
      });
    });
    this.data = arrayProp;
    return this;
  }

  removeEmpty() {
    // if the entire row is empty -> remove the row & shift up
    this.data.filter(cur => {
      return _.every(cur, el => {
        return !el.value;
      });
    });
    return this;
  }

  getKeys(selectors = ["keys"]) {
    // data should be [ {}, {}, {} ] not array of arrays!
    return _.map(this.data, prop => {
      const keys = {};
      Object.keys(prop).forEach(key => {
        const val = prop[key];
        selectors.forEach(selector => {
          if (val[selector] != null) {
            Object.assign(keys, val[selector]);
            return keys;
          }
        });
      });
      return keys;
    });
  }

  get() {
    return this.data;
  }
};

const booleanOptions = [
  {
    value: true,
    text: "yes"
  },
  {
    value: false,
    text: "no"
  }
];

export const ruleOptionBuilder = (priceList, t = k => k) => {
  const res = cleanObject({
    laneId: (priceList.lanes || []).map(el => {
      return {
        value: el.id,
        text: el.name
      };
    }),
    volumeGroupId: (priceList.volumes || []).map(el => {
      return {
        value: el.id,
        text: el.name || `${el.serviceLevel} [${el.uom}]`
      };
    }),
    volumeRangeId: priceList.volumes
      ? (unwind(priceList.volumes, "ranges") || []).map(el => {
          return {
            filter: el.id,
            value: el.ranges.id,
            text:
              el.ranges.name || `${el.ranges.from} - ${el.ranges.to} ${el.uom}`
          };
        })
      : undefined,
    equipmentGroupId: (priceList.equipments || []).map(el => {
      return {
        value: el.id,
        text: el.name
      };
    }),
    serviceLevel: serviceLevels.map(el => {
      return {
        value: el,
        text: t(`price.list.form.serviceLevel.${el}`)
      };
    }),
    dangerous: booleanOptions,
    taxRoad: booleanOptions,
    weekday: [
      { value: 0, text: "monday" },
      { value: 1, text: "tuesday" },
      { value: 2, text: "wednesday" },
      { value: 3, text: "thursday" },
      { value: 4, text: "friday" },
      { value: 5, text: "saterday" },
      { value: 6, text: "sunday" }
    ],
    month: [
      { value: 1, text: "january" },
      { value: 2, text: "february" },
      { value: 3, text: "march" },
      { value: 4, text: "april" },
      { value: 5, text: "may" },
      { value: 6, text: "june" },
      { value: 7, text: "july" },
      { value: 8, text: "august" },
      { value: 9, text: "september" },
      { value: 10, text: "oktober" },
      { value: 11, text: "november" },
      { value: 12, text: "december" }
    ],
    incoterm: incoterms.map(el => {
      return {
        value: el,
        text: el
      };
    })
  });
  return res;
};
