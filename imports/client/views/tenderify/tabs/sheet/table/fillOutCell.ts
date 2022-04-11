import { ValueSetterParams } from "@ag-grid-community/core";
import get from "lodash.get";
import FillOutRenderer from "./FillOutRenderer";
import { objAssignDeep } from "/imports/utils/functions/fnObjectAssignDeep";
import { unformatNumberStr } from "/imports/utils/functions/fnStringNumber";

import { CALCULATION_CELL_STYLE_ERROR } from "../utils/enums";

export const fillOutCell = {
  cellRendererFramework: FillOutRenderer,
  cellEditor: "agTextCellEditor",
  cellEditorParams: {
    useFormatter: true
  },
  valueFormatter({ value }) {
    if (value?.formula) return `=${value.formula}`;
    return get(value, ["amount", "value"], 0);
  },
  valueSetter(params: ValueSetterParams) {
    const { colDef, newValue } = params;

    if (!newValue || newValue === "") {
      objAssignDeep(params.data, null, `${colDef.field}.amount.value`);
      return true;
    }

    // determine if a formula was entered:
    const isFormula = String(newValue)[0] === "=";
    if (isFormula) {
      objAssignDeep(
        params.data,
        newValue.substring(1),
        `${colDef.field}.formula`
      );
      return true;
    }

    // extract value & currency:
    // extract 3-digit currencies & decimal number
    const decimal = parseFloat(String(newValue).match(/[\d\.]+/)?.[0]);
    const currency = String(newValue).match(/[A-Z]{3}/)?.[0];

    if (isNaN(decimal) || !isFinite(decimal)) {
      return false; // don't set invalid numbers!
    }
    objAssignDeep(params.data, decimal, `${colDef.field}.amount.value`);
    currency &&
      objAssignDeep(params.data, currency, `${colDef.field}.amount.unit`);

    // when the entered value was a number > we reset the formula
    objAssignDeep(params.data, null, `${colDef.field}.formula`);
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
