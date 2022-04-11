/* global Migrations */
import { Tender } from "/imports/api/tenders/Tender";

const debug = require("debug")("migration:52");

/** migrates the chargelines to a new schema:
 * chargelines will not have an id field, but a chargeId field
 * this to prevent apollo cache issues.
 * bidders.$.simpleBids.$.chargeLines.$
 */
Migrations.add({
  version: 53,
  name: "tender-bidder-responses-split-out",
  up: async () => {
    const tenders = await Tender.find(
      { "bidders.requirements.response": { $exists: true } },
      { fields: { bidders: 1 } }
    ).fetch();

    // update shipment based on stage data
    const bulkOp = Tender._collection
      .rawCollection()
      .initializeUnorderedBulkOp();

    if (tenders.length === 0)
      return console.log("migration 53: no items found to migrate");

    tenders.forEach(({ _id, bidders }) => {
      // lvl bidders:
      const biddersMod = bidders.map(({ requirements, ...bidderEntry }) => {
        // lvl simpleBids: (not all bidders might have entered items)
        if (!requirements) return { ...bidderEntry };
        const bidsMod = requirements.map(({ id, response }) => ({
          id,
          ...(typeof response === "boolean"
            ? { resonseBool: response }
            : { responseStr: response })
        }));

        return {
          ...bidderEntry,
          requirements: bidsMod
        };
      });
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
