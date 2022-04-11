/* global Migrations */
import { Address } from "/imports/api/addresses/Address";

const debug = require("debug")("migration:50");

Migrations.add({
  version: 50,
  name: "Correct empty and missing zip codes, remove zipCode field",
  up: async () => {
    const addresses = await Address._collection
      .find(
        {
          zip: null
        },
        { fields: { zipCode: 1 } }
      )
      .fetch();

    if (addresses.length > 0) {
      // update shipment based on stage data
      const bulkOp = Address._collection
        .rawCollection()
        .initializeUnorderedBulkOp();

      addresses.forEach(({ _id, zipCode }) => {
        const $set = { zip: zipCode || "" };
        debug("correct %s to zipCode %s", _id, zipCode || "");
        bulkOp.find({ _id }).updateOne({ $set, $unset: { zipCode: null } });
      });
      try {
        await bulkOp.execute();
      } catch (error) {
        console.error("migration 50 error:", error);
      }
    }
  }
});
