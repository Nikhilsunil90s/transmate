// for autocomplete
// const GET_GRID_AUTOCOMPLETE_DATA = gql`
//   query tenderifyBidAutoCompleteData(
//     $input: tenderifyBidAutoCompleteDataInput!
//   ) {
//     response: tenderifyBidAutoCompleteData(input: $input) {
//       id
//       data {
//         value
//         text
//       }
//     }
//   }
// `;

// modifies curCol
// used for the mapping table
export const gridColToTypeDef = ({
  col,
  curCol,
  mappingListOptions,
  client
}) => {
  col = col ?? curCol;

  // number formatting:
  if (col.cType === "fillOut" || col.input?.type === "numeric") {
    curCol.type.push("numeric");
  } else if (col?.input?.type === "list") {
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

  // if (curCol?.input?.type === "autocomplete") {
  //   curCol.types.push("autocomplete"); // will provide the editor
  //   curCol.cellEditorParams = {
  //     autocomplete: {
  //       fetch: (cellEditor, text, update) => {
  //         const query =
  //           text.toLowerCase() || cellEditor.eInput.value.toLowerCase();
  //         if (query.length > 3) {
  //           client
  //             .query({
  //               query: GET_GRID_AUTOCOMPLETE_DATA,
  //               variables: {
  //                 input: {
  //                   source: curCol.input.source,
  //                   query
  //                 }
  //               }
  //             })
  //             .then(result => {
  //               // let items = data.map(d => ({ value: d.numericCode, label: d.name, group: d.region }));
  //               // update(items);
  //             })
  //             .catch(error => console.error({ error }));
  //         }
  //       }
  //     },
  //     strict: !!curCol?.input?.strict,
  //     placeholder: "Please Select"
  //   };
  // }
};
