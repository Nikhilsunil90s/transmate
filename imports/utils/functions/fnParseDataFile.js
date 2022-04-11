import Papa from "papaparse";
import pick from "lodash.pick";
import dot from "dot-object";
import cleanDeep from "clean-deep";
import { toast } from "react-toastify";

const debug = require("debug")("upload");

export const ALLOWED_FILE_TYPES = ["text/csv", "application/vnd.ms-excel"];

/**
 * function used in UI to (papa) parse a file and do something with the data
 * @param {File} file
 * @param {Function} onCompleteCb
 * @param {Object=} options
 * @param {Array} options.headers used to pick the columns that are required
 * @param {Object} options.transform dot.object transform {}
 * @param {Boolean} options.checkRequiredKeys check if all headers that are passed in, are also present with values
 * @param {String} options.keyField column that must contain data (to filter out the empty ones)
 */
export const parseDataFile = ({ file, onCompleteCb, options = {} }) => {
  const dataRows = [];
  let rowNum = 1;
  const parseRow = row => {
    let rowObj = row || {};

    // pick headers if header validation is given
    if (options.headers) {
      rowObj = pick(rowObj, options.headers);
    }

    if (options.transform) {
      rowObj = { ...cleanDeep(dot.transform(options.transform, rowObj)) };
    }

    // remove empty fields:
    // rowObj = pick(rowObj, value => value !== undefined && value !== null);

    // skipping empty rows: keyField
    if (options.keyField && !rowObj[options.keyField]) return;

    // add rowNumber to the data:
    const el = { ...rowObj, rowNum };
    rowNum += 1;
    dataRows.push(el);
  };

  // papa-parse here:
  let allKeyPresent = false; // Flag
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    step(row, parser) {
      // modified here!!! -> does this differ for "header:false" || "header: true"??
      const dataObj = row.data; // oPath(["data", 0], row); // added to get the object
      if (options.checkRequiredKeys && !allKeyPresent && options.headers) {
        // Only check if flag is not set, i.e, for the first time
        parser.pause(); // pause the parser

        let firstRowCols = Object.keys(dataObj || {});
        firstRowCols = firstRowCols.filter(el => el !== "");
        const matchingHeaderKeys =
          JSON.stringify(firstRowCols) === JSON.stringify(options.headers);

        // Now check object keys, if it match
        if (matchingHeaderKeys) {
          // every required key is present
          allKeyPresent = true;

          // parse:
          parseRow(dataObj);

          parser.resume();
        } else {
          // some key is missing, abort parsing
          toast.error("headers do not match, please use the upload template");
          parser.abort();
        }
      } else {
        // we already match the header, all required key is present
        // Do the Data processing here
        parseRow(dataObj);
      }
    },
    transform(val) {
      // applies a fn on each cell -> trims & removes ""
      let newVal = val.trim();
      newVal = newVal === "" ? undefined : newVal;
      return newVal;
    },
    complete() {
      debug("parsed data %o", dataRows);
      onCompleteCb(dataRows);
    }
  });
};
