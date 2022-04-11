/* global Migrations */
import { PriceRequest } from "/imports/api/priceRequest/PriceRequest";

const debug = require("debug")("migration:52");

/** migrates the chargelines to a new schema:
 * chargelines will not have an id field, but a chargeId field
 * this to prevent apollo cache issues.
 * bidders.$.simpleBids.$.chargeLines.$
 */
Migrations.add({
  version: 52,
  name: "priceRequest-chargeLines--schema-change",
  up: async () => {
    const priceRequests = await PriceRequest.find(
      { "bidders.simpleBids.chargeLines.id": { $exists: true } },
      { fields: { bidders: 1 } }
    ).fetch();

    // update shipment based on stage data
    const bulkOp = PriceRequest._collection
      .rawCollection()
      .initializeUnorderedBulkOp();

    if (priceRequests.length === 0)
      return console.log("migration 52: no items found to migrate");

    priceRequests.forEach(({ _id, bidders }) => {
      // lvl bidders:
      const biddersMod = bidders.map(
        ({ simpleBids, chargeLines: removeFaulty, ...bidderEntry }) => {
          // lvl simpleBids: (not all bidders might have entered items)
          if (!simpleBids) return { ...bidderEntry };
          const bidsMod = simpleBids.map(({ chargeLines, ...bid }) => {
            // lvl chargeLines:
            if (!chargeLines) return { ...bid };
            const chargeLinesMod = chargeLines.map(
              ({ id, chargeId, ...chargeLineData }) => ({
                chargeId: chargeId || id,
                ...chargeLineData
              })
            );
            return {
              ...bid,
              chargeLines: chargeLinesMod
            };
          });

          return {
            ...bidderEntry,
            simpleBids: bidsMod
          };
        }
      );
      bulkOp.find({ _id }).updateOne({ $set: { bidders: biddersMod } });
    });
    try {
      const { result = {} } = await bulkOp.execute();
      debug("migration 52 results %o", result);
    } catch (error) {
      console.error("migration 52 error:", error);
    }
    return console.log("done");
  }
});
