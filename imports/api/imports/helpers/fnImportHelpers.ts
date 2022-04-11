import { oPath } from "/imports/utils/functions/path";
import { importFields } from "/imports/api/imports/helpers/importFields";
import { unformatNumberStr } from "/imports/utils/functions/fnStringNumber";

import moment from "moment";

import {
  ShipmentImport,
  ShipmentImportError
} from "../interfaces/shipmentImport";

const uniqWith = require("lodash.uniqwith");
const isEqual = require("lodash.isequal");
const dot = require("dot-object");

// const debug = require("debug")("import:helper");

export const startsWith = (string: string, start: string) => {
  return RegExp(`^${start}`).test(string);
};

/**
 *
 * @param {Object} imp
 * @param {Object} data
 * @param {*} level
 * @param {*} errors
 * @returns {Object}
 */
export const mapImportRow = (
  imp: ShipmentImport,
  data = {},
  level: "shipment" | "" = "",
  errors: Array<ShipmentImportError>
) => {
  const mapped = {};
  const dateFormat = oPath(["settings", "dateFormat"], imp) || "YYYY-MM-DD";

  Object.entries(data).forEach(([header, value]: [string, string]) => {
    let delimiter;
    let field = imp.mapping.headers[header]; // if field == undefined -> unmapped
    const definition = importFields.find(el => el.key === field);
    let newValue: any = value;
    let mappedValues;

    if (field && field !== "ignore") {
      if (!definition) {
        errors.push({
          error: "mapping",
          message: `No definition for field ${field}`
        });
        return;
      }
      if (level) {
        if (!startsWith(field, level)) {
          return;
        }
        field = field.substr(`${level}.`.length);
      }

      // format conversions:
      try {
        if (definition.type === Date) {
          const mm = moment(newValue, dateFormat, true)
            .seconds(0)
            .milliseconds(0);
          if (!mm.isValid())
            throw new Error(`Date was not recognized - format ${dateFormat}`);
          newValue = mm.toISOString();
        } else if (definition.type === Number) {
          newValue = unformatNumberStr(newValue);
          if (Number.isNaN(newValue))
            throw new Error("Results in an invalid number");
          newValue = +newValue; // convert to numeric
        } else if (definition.type === Boolean) {
          newValue = !!newValue;
        }

        if (/\.zip$/.test(field)) {
          field = field.replace(/\.zip$/, ".zipCode");
        }

        mappedValues = oPath(["mapping", "values", header], imp);
        if (field === "planner") {
          field = "plannerIds";
          delimiter = "|";
          newValue =
            newValue != null
              ? newValue.split(delimiter).map(v => {
                  return (mappedValues && mappedValues[v]) || v;
                })
              : undefined;
        } else if (mappedValues) {
          newValue = mappedValues[newValue];
        }
        mapped[field] = newValue;
      } catch (err) {
        errors.push({
          error: "conversion",
          message: `conversion failed for field:${header}, ${value} should be a valid ${definition.type.name}. ${err.message}`
        });
      }
    }
  });

  ["from", "to"].forEach(fromTo => {
    if (mapped[`${fromTo}.locode`]) {
      // keep only A-Z and numbers and numbers
      const locode = mapped[`${fromTo}.locode`]
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "");

      // if 5 chars, it will contain country + locationCode
      if (locode.length === 5) {
        mapped[`${fromTo}.location.countryCode`] = locode.substring(0, 2);
        mapped[`${fromTo}.location.locationCode`] = locode.substring(2, 5);
      }

      // if 3 chars, it will be locationCode only
      else if (locode.length === 3 && mapped[`${fromTo}.address.country`]) {
        mapped[`${fromTo}.location.countryCode`] =
          mapped[`${fromTo}.address.country`];
        mapped[`${fromTo}.location.locationCode`] = locode;
      } else {
        errors.push({
          error: "conversion",
          message: `conversion failed for field:LOCODE . Should be a 3 or 5 chars!`
        });
      }
    }
    return delete mapped[`${fromTo}.locode`];
  });
  return mapped;
};

/**
 *
 * @param {Object} imp import document
 * @param {Array<Object>} rows rows array
 * @param {string} dimension
 * @param {Array<Object>} errors
 * @returns {Array<Object>}
 */
export const pivot = (imp, rows, dimension, errors) => {
  // Get mapped dimension data
  let childs = rows.map(row => {
    return mapImportRow(imp, row.data, dimension, errors);
  });

  // Group rows (this filters out duplicates, in case there's more dimensions
  // in the data)
  childs = uniqWith(childs, isEqual);

  // Expand the mapped field names ('a.b.c') into a real object
  return childs.map(child => {
    return dot.object(child);
  });
};
