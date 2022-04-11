import { ValueSetterParams } from "@ag-grid-community/core";
import get from "lodash.get";
import SimpleCalculationRenderer from "./SimpleCalculationRenderer";
import { objAssignDeep } from "/imports/utils/functions/fnObjectAssignDeep";
import { unformatNumberStr } from "/imports/utils/functions/fnStringNumber";

import { CALCULATION_CELL_STYLE_ERROR } from "../utils/enums";

export const simpleCalculationCell = {
  cellRendererFramework: SimpleCalculationRenderer,
  cellEditor: "agTextCellEditor",
  cellEditorParams: {
    useFormatter: true
  },
  valueFormatter({ value }) {
    if (value?.formula) return `=${value.formula}`;
    return typeof value === "number" ? value : get(value, ["value"], 0);
  },
  valueSetter(params: ValueSetterParams) {
    const { colDef, newValue, oldValue } = params;

    // calculation cell data format {value, formula}

    if (!newValue || newValue === "") {
      objAssignDeep(params.data, { value: null }, `${colDef.field}`);
      return true;
    }

    // determine if a formula was entered:
    const isFormula = String(newValue)[0] === "=";
    if (isFormula) {
      objAssignDeep(
        params.data,
        { formula: newValue.substring(1) },
        `${colDef.field}`
      );
      return true;
    }

    // extract value & currency:
    // extract 3-digit currencies & decimal number
    const decimal = parseFloat(String(newValue).match(/[\d\.]+/)?.[0]);

    if (isNaN(decimal) || !isFinite(decimal)) {
      return false; // don't set invalid numbers!
    }
    objAssignDeep(params.data, { value: decimal }, `${colDef.field}`);

    return true;
  },
  cellStyle({ value }) {
    return value.errors?.length ? CALCULATION_CELL_STYLE_ERROR : {};
  },
  filter: "agNumberColumnFilter",
  filterParams: {
    allowedCharPattern: "//[€][d]*",
    // "//[-]{0,1}[d]*[.|,]{0,1}[d]+//g",
    numberParser(text) {
      return text == null ? null : parseFloat(unformatNumberStr(text));
    }
  }
};
