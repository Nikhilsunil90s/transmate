import { ValidatedMethod } from "meteor/mdg:validated-method";
import SimpleSchema from "simpl-schema";
import SecurityChecks from "/imports/utils/security/_security.js";
import { ImportMapping } from "/imports/api/imports/Import-mapping";
import { Import } from "/imports/api/imports/Import-shipments.js";
import { oPath } from "/imports/utils/functions/path";
import { _ } from "meteor/underscore";
import { AllAccounts } from "../../allAccounts/AllAccounts.js";

const debug = require("debug")("method:imports:mapping");

export const mapFieldsImport = new ValidatedMethod({
  name: "map.fields.import",
  description: "Method for mapping header fields",
  validate: new SimpleSchema({
    header: { type: String },
    key: { type: String },
    importId: { type: String }
  }).validator(),
  run({ importId, header, key }) {
    SecurityChecks.checkLoggedIn(this.userId);

    // 0. store mapping in edi_imports
    // 1. store mapping in edi_mapping
    // 2. return import/error
    const accountId = AllAccounts.id(this.userId);
    let result = {};
    try {
      const imp = Import.first(importId);
      const updates = {};
      const cleanKey = Import.mongoKey(header);
      updates[["mapping", "headers", cleanKey].join(".")] = key;
      debug("update mapping db with %o", updates, header, key);

      const numHeaders = imp.headers.length;
      const numMapped = oPath(["mapping", "headers"], imp)
        ? _.keys(imp.mapping.headers).length
        : 0;
      updates["progress.mapping"] = Math.round((numMapped / numHeaders) * 100);

      // Update the general mapping document, so the system can learn over
      result = imp.update(updates);
      debug("update mapping result %o", result);
      ImportMapping._collection.upsert(
        {
          accountId,
          type: imp.type
        },
        {
          $set: {
            [["headers", cleanKey].join(".")]: key
          }
        }
      );
    } catch (err) {
      console.error(err);
      throw err;
    }
    return result;
  }
});
