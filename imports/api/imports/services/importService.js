import { _ } from "meteor/underscore";

// collections:
import { ImportMapping } from "/imports/api/imports/Import-mapping";
import { EdiRows } from "/imports/api/imports/Import-shipments-rows";
import { Import } from "/imports/api/imports/Import-shipments";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { oPath } from "/imports/utils/functions/path";

const debug = require("debug")("imports:mapping");

// FIXME: still used?
export const importService = {
  init({ importId }) {
    this.imp = Import.first(importId);
    this.account = AllAccounts.myAccount();
    return this;
  },

  async importValues({ header }) {
    const key = `data.${Import.mongoKey(header)}`;
    let values = _.compact(await EdiRows.rawCollection().distinct(key));
    const delimiter = "|";
    values = _.uniq(
      _.flatten(
        values.map(vals => {
          return vals.split(delimiter);
        })
      )
    );
    const updates = {};
    _.each(values, v => {
      const prop = `mapping.values.${Import.mongoKey(header)}.${Import.mongoKey(
        v
      )}`;
      if (!this.imp[prop]) {
        updates[prop] = null;
      }
    });
    try {
      this.imp.update(updates);
    } catch (error) {
      throw new Meteor.Error("import.values.mongo", error.message);
    }
    return values;
  },

  // eslint-disable-next-line consistent-return
  mapHeader({ header, key }) {
    // check if the key hasn't been mapped yet!
    const test = Object.values(
      oPath(["mapping", "headers"], this.imp) || {}
    ).includes(key);

    if (test && key !== "ignore")
      throw new Meteor.Error(
        "mapping error",
        "This Field has already been mapped"
      );
    try {
      debug("update mapping db with %o", { header, key });
      const importId = this.imp._id;

      // method call as updates with dot's in key give errors on client!
      Meteor.call("map.fields.import", { header, key, importId });

      if (Import.fieldOptions(key)) {
        const values = this.importValues({ header });
        return values;
      }
    } catch (e) {
      console.error(e);
      return e;
    }
  },

  mapValue({ header, importValue, systemValue }) {
    const updates = {};
    updates[
      `mapping.values.${Import.mongoKey(header)}.${Import.mongoKey(
        importValue
      )}`
    ] = systemValue;
    this.imp.update(updates);

    // Update the general mapping document, so the system can learn over time
    ImportMapping._collection.upsert(
      {
        accountId: this.account._id,
        type: this.imp.type
      },
      {
        $set: {
          [`values.${Import.mongoKey(header)}.${Import.mongoKey(
            importValue
          )}`]: systemValue
        }
      }
    );
  }
};
