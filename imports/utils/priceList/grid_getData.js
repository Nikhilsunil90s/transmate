/* eslint-disable func-names */
/* eslint-disable consistent-return */
import get from "lodash.get";
import { matrixLookup } from "/imports/utils/functions/fnMatrixHelpers.js";
import { buildGridQuery } from "/imports/utils/priceList/grid_buildQuery.js";
import { gridInitializeEmptyCell } from "./grid_initializeDataForCell";
import { removeEmpty } from "../functions/fnRemoveNullFromObject";

const debugGrid = require("debug")("price-list:grid");
const isMatch = require("lodash.ismatch");

export const flattenRules = ({ rules, rulesUI }) => {
  const flatRules = rules.reduce((a, x) => {
    return Object.assign(a, x);
  }, {});
  return { ...flatRules, ...rulesUI };
};

const initializeData = ({ rowCount, colCount }) => {
  const base = Array.from(Array(rowCount), () => {
    return Array(colCount).fill(null);
  });
  return base;
};

// will be using 'this' -> function needed
const getGridData = function(cellData = {}) {
  debugGrid("pageFilters: %o", this.pageFilters);
  const pageFilters = buildGridQuery({
    pageFilters: this.pageFilters
  });
  debugGrid("data from db: %o", cellData);
  this.unmatched = [];
  this.doubles = [];

  (cellData?.rates || []).map(itemRaw => {
    // clean graphQl object
    const item = removeEmpty(itemRaw, true);
    const rules = flattenRules(item);
    const i = this.gridrowsKeys.findIndex(el => {
      return isMatch(rules, el);
    });
    const j = this.gridcolsKeys.findIndex(el => {
      return isMatch(rules, el);
    });
    if (isMatch(rules, pageFilters) && i > -1 && j > -1) {
      const idInGrid = get(this.base, [i, j, "id"]);
      const isDouble = idInGrid && idInGrid !== item.id;
      this.base[i][j] = {
        ...item,
        fieldType: "rate",
        ...(isDouble && { doubleCount: true })
      };
      if (isDouble) this.doubles.push(item);
      return this.base[i][j];
    }

    // items that are returned in the query, but are not matched in the grid
    this.unmatched.push(item);
    return undefined;
  });

  // init empty cells
  this.base.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (!cell) {
        this.base[i][j] = gridInitializeEmptyCell.apply(this, [
          { row: i, col: j }
        ]);
      }
    });
  });

  // get/set header values
  ["col", "row"].forEach(prop => {
    const listProps = this[`grid${prop}s`].slice(1);
    if (listProps && listProps.length > 0) {
      listProps.forEach((l1, i) => {
        return l1.forEach((l2, j) => {
          let c;
          let r;
          const val =
            (l2.field &&
              matrixLookup(
                this.base,
                {
                  row: prop === "col" ? "*" : i,
                  col: prop === "row" ? "*" : j
                },
                l2.field
              )) ||
            get(l2, ["value"]) ||
            get(l2, ["label"]);

          // i & j depends on prop
          if (prop === "col") {
            [r, c] = [i, j];
          } else {
            [r, c] = [j, i];
          }

          this.base[r][c] = Object.assign(l2, {
            value: val || l2.defaultValue,
            isHeader: true,
            isColHeader: prop === "col",
            isRowHeader: prop === "row"
          });
          return this.base[r][c];
        });
      });

      // fix top row:
      if (this.table && prop === "col") {
        return this.table.updateSettings({
          fixedRowsTop: listProps.length
        });
      }
    }
    return undefined;
  });
};

export { getGridData, initializeData };
