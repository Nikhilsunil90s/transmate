// modifies curCol
// used for the unified bidding sheet
export const gridColToTypeDef = ({
  col,
  curCol,
  mappingListOptions,
  client
}) => {
  col = col ?? curCol;

  // number formatting:
  if (col?.input?.type === "list") {
    switch (col.input.source) {
      case "currencies":
        curCol.type.push("currency");
        break;
      case "countryCodes":
        curCol.type.push("countryFlagSelect");
        break;
      // should return the equipments list from new structure!
      // case "equipments":
      //   curCol.source = mappingListOptions.equipments;
      //   curCol.allowInvalid = true; // otherwise autocomplete + strict = false
      //   break;

      // WARNING: serviceRender should be added as columnType!!
      case "services": {
        curCol.type.push("serviceRender");
        break;
      }
      case "incoterms":
      default: {
        curCol.cellEditor = "agRichSelectCellEditor";
        curCol.cellEditorParams = {
          values: mappingListOptions[col.input.source] || []
        };
      }
    }
  }

  if (
    (col.cType === "fillOut" && col.key === "chargeDescription") ||
    col.cType === "calculationCharge"
  ) {
    // enables complex cell {amount: {value, unit}, formula, tooltip}
    curCol.type.push("fillOutCell");
  }
  if (col.cType === "calculationField") {
    // enables complex cell {value, formula}
    curCol.type.push("simpleCalculationCell");
  }

  if (col.group === "calculation") {
    // adds formatting:
    curCol.type.push("calculationCell");
  }

  if (
    (col.cType === "fillOut" && !col?.input?.type === "list") ||
    col.input?.type === "numeric"
  ) {
    // adds value formatting:
    curCol.type.push("numeric");
  }

  if (col.cType === "statistics") {
    if (col.key === "allocation") {
      // adds value formatting:
      curCol.type.push("percentValue");
    } else {
      // adds value formatting:
      curCol.type.push("currencyValue");
    }
  }
};
