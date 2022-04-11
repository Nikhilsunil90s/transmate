import { invert } from "/imports/utils/functions/fnObjectInvert";
import startsWith from "underscore.string/startsWith";
import { Mongo } from "meteor/mongo";
import Model from "../Model.js";

// data
import { ImportShipmentSchema } from "../_jsonSchemas/simple-schemas/collections/import-shipments";
import { getFieldOptions } from "./helpers/getFieldOptions";

// const debug = require("debug")("collection:import");

class Import extends Model {
  // eslint-disable-next-line camelcase
  static before_create(obj) {
    delete obj.createdAt;

    obj.progress = {
      data: 0,
      lookup: 0,
      mapping: 0,
      jobs: 0,
      process: 0
    };
    return obj;
  }

  getHeader(header) {
    return invert(this.mapping.headers)[header];
  }

  getHeaders(level = "") {
    const headers = {};
    Object.entries(this.mapping.headers || {}).forEach(([header, field]) => {
      if (level && !startsWith(field, `${level}.`)) {
        return;
      }
      headers[field] = header;
      // eslint-disable-next-line consistent-return
      return headers[field];
    });
    return headers;
  }

  static mongoKey(key) {
    // .replace "\\", "\\\\"
    return key.replace(/\$/g, "\\u0024").replace(/\./g, "\\u002e");
  }

  static fieldOptions(key) {
    return getFieldOptions(key);
  }
}

Import._collection = new Mongo.Collection("edi_imports");

Import._collection.attachSchema(ImportShipmentSchema);
Import._collection = Import.updateByAt(Import._collection);

export { Import };
