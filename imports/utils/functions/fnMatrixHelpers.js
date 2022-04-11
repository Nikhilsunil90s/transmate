/* eslint-disable no-restricted-syntax */
import get from "lodash.get";
import { oPath } from "./path";
import { range } from "./fnRngGenerator";

const debug = require("debug")("price-list:data");

// select data out of a 2x2 matrix and return it in a single array

export const selectFromMatrix = (
  [[startRow, startCol, endRow, endCol]],
  data
) => {
  let i;
  let j;
  if (endRow === -1) {
    // eslint-disable-next-line no-param-reassign
    endRow = data.length - 1;
  }
  if (endCol === -1) {
    // eslint-disable-next-line no-param-reassign
    endCol = oPath([0, "length"], data) || 1 - 1;
  }
  const res = [];
  for (i of range(startRow, endRow)) {
    for (j of range(startCol, endCol)) {
      res.push(data[i][j]);
    }
  }
  debug("selected data: %O", res);
  return res;
};

// helper to lookup field defaults based on tabular data
// we use [].some to break once we have found a value.
export const matrixLookup = (ref = [], { row, col }, prop = "") => {
  let val;
  let curRow;
  if (row === "*") {
    ref.some(rowArr => {
      val = get(rowArr, [col, ...prop.split(".")]);
      return !!val;
    });
  }
  if (col === "*") {
    curRow = ref[row] || [];
    curRow.some(rowItem => {
      val = get(rowItem, [...prop.split(".")]);
      return !!val;
    });
  }

  return val;
};

export const matrixPluck = (matrix, path) => {
  return matrix.map(row => {
    return row.map(el => {
      return oPath(path, el);
    });
  });
};
