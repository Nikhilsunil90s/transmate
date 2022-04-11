import get from "lodash.get";
import { getSelectorForCell } from "./grid_helpers";

const debugGrid = require("debug")("priceList:grid:afterchange");

const afterChangeHandler = ({
  change: [row, col, oldValue, newValue],
  grid
}) => ({
  row,
  col,
  oldValue,
  newValue,
  grid,

  checkPermissions() {
    // todo
    return this;
  },

  initializeData() {
    this.cellData = get(this.grid, ["base", this.row, this.col]) || {};
    this.existing = !!this.cellData.id;
    return this;
  },
  checkIfHeader() {
    this.isHeader = this.cellData.isHeader;
    this.isColHeader = this.cellData.isColHeader;
    this.isRowHeader = this.cellData.isRowHeader;
    return this;
  },
  getUpdate() {
    // cell selector (rules, rulesUI)
    const { selector } = getSelectorForCell.call(this.grid, {
      row: this.row,
      col: this.col
    });

    if (this.isHeader) {
      // 0 if rowHeader -> get headerKeys for that row || col
      // 1 cellData
      // 2 update template structure
      this.update = {
        update: { [this.cellData.field]: this.newValue },
        selector,
        isHeader: this.isHeader
      };
    } else if (this.newValue != null && this.newValue !== "") {
      // currency cells can have the currency pasted in it.
      // newValue = {value, unit}
      const { amount } = this.cellData;
      this.update = {
        selector,
        update: {
          ...this.cellData,
          amount: { ...amount, ...this.newValue }
        }
      };
    } else {
      // if the value is "" or null -> we delete from db
      this.update = {
        selector,
        update: null
      };
    }

    debugGrid("update: %o", this.update);
    return this.update;
  }
});

export { afterChangeHandler };
