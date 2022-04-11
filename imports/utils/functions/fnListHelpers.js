import { _ } from "meteor/underscore";

// compares array of objects and retruns an object with elements with same key value
export const intersectList = function intersectList(arr) {
  return arr.reduce((acc, cur) => {
    Object.entries(cur).forEach(([k, v]) => {
      if (acc[k] === v && v != null) {
        acc[k] = v;
      } else {
        delete acc[k];
      }
    });
    return acc;
  });
};

// returns unique array elements
// !! checks [ { key: value} ] only!
export const uniqueItems = function uniqueItems(list) {
  const result = [];
  const map = new Map();
  Object.entries(list).forEach(([, v]) => {
    const key = Object.keys(v)[0];
    if (key && !map.has(key)) {
      map.set(key, true);
      result.push({
        [`${key}`]: v[key]
      });
    }
  });

  return result;
};

// returns unique array of objects
// compares whole {}
export const distinctList = function distinctList(list) {
  const distinct = (value, index, self) => {
    return (
      self.findIndex(obj => {
        return _.isEqual(value, obj);
      }) === index
    );
  };
  return list.filter(distinct);
};

// find element in a list
export const listFind = function listFind(list, selector) {
  const k = Object.keys(selector)[0];
  if (!k) {
    return;
  }
  // eslint-disable-next-line consistent-return
  Object.entries(list).forEach(([i, v]) => {
    if (v[k] === selector[k]) {
      return {
        index: i,
        value: v
      };
    }
  });
};

// find key in a list
export const listFindKey = function listFindKey(list, key) {
  // eslint-disable-next-line consistent-return
  Object.entries(list).forEach(([i, v]) => {
    if (v[key] != null) {
      return {
        index: i,
        value: v[key]
      };
    }
  });
};
