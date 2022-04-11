/* eslint-disable no-await-in-loop */
import { Shipment } from "/imports/api/shipments/Shipment.js";
import { check } from "/imports/utils/check.js";

const hash = require("object-hash");

const debug = require("debug")("shipment:changes");

/* shipmentid and context given
this should only be visible to owner, so add accountID as minimum check
*/
export const getShipmentChanges = ({ accountId }) => ({
  accountId,
  async get({ shipmentId }) {
    check(shipmentId, String);
    check(accountId, String);
    debug("start changes collection for %o", shipmentId);
    const { _id, stageIds = [], itemIds = [], created: shipmentCreated } =
      (await Shipment.first(
        { _id: shipmentId, accountId },
        {
          fields: { stageIds: 1, itemIds: 1, created: 1 }
        }
      )) || {};
    debug("shipment data:%o", { _id, stageIds, itemIds });

    // no access or no data returned
    if (!_id) return [];

    // get changes for shipment and stages

    // build filter
    const query = {
      $or: [
        { docId: shipmentId, collection: "shipments" },
        { docId: { $in: stageIds }, collection: "stages" },
        { docId: { $in: itemIds }, collection: "shipment.items" }
      ]
    };
    debug("get data for changes %j", query);
    const rawDB = Shipment._collection.rawDatabase();
    const cursor = await rawDB
      .collection("logs.changes")
      .find(query, { sort: { "created.at": -1 } });
    const results = [];

    let lastChange;

    while (await cursor.hasNext()) {
      const { _id: changeId, created, changes, userId, collection, docId } =
        (await cursor.next()) || {};

      // process doc here
      // get timestamp
      // build object with chronological update/delete/insert
      // check if timestamp is close to last ts -> include in same group
      // difference less than one minute (=60x1000)

      debug("diff", created.at, lastChange - new Date(created.at));
      lastChange = new Date(created.at);

      // debug("change obj %j", obj);
      // eslint-disable-next-line no-loop-func
      Object.keys(changes).forEach(change => {
        const keys = Object.keys(changes[change]) || [];

        // only add change if a key has changed
        // exclude the updated flags
        if (
          keys.filter(el => !["updated", "updates"].includes(el)).length > 0
        ) {
          const id = hash({
            id: typeof changeId === "string" ? changeId : changeId.toString(),
            changes: changes[change]
          });
          results.push({
            id,
            userId,
            collection,
            ts: created.at,
            change,
            keys,
            docId,
            detail: changes[change]
          });
        }
      });
    }

    // add created tag
    results.push({
      id: 1,
      userId: shipmentCreated.by,
      collection: "shipment",
      docId: shipmentId,
      ts: shipmentCreated.at,
      change: "created",
      keys: ["*"],
      detail: {}
    });
    debug("results changes %o", results);
    return { id: shipmentId, changes: results };
  }
});
