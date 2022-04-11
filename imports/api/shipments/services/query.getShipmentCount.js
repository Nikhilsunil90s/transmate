import { bigQuery } from "@transmate-eu/bigquery_module_transmate";
import { shipmentAggregation } from "./query.pipelineBuilder";

const debug = require("debug")("bq:bigquery-count");

const shipmentCounts = {};
export const countShipments = ({ accountId, userId }) => ({
  accountId,
  userId,
  async get() {
    const datetime = new Date().getTime();
    debug("get count for account %j", accountId);
    const buffer = shipmentCounts[accountId];

    // buffer results 60sec
    if (buffer && datetime - buffer.datetime < 60 * 1000) {
      // return buffer
      debug("return BQ count buffer ");
      return buffer;
    }
    let count = { draft: 0 };
    if (
      // you can only use BQ on a remote db
      !process.env.MONGO_URL.includes("localhost") &&
      !process.env.MONGO_URL.includes("127.0.0.1")
    ) {
      const res = await bigQuery.getShipmentCount(accountId); // {data: [{name,y}], total}

      (res.data || []).forEach(({ name, y }) => {
        count[name] = y;
      });
    } else {
      const srv = shipmentAggregation({ accountId, userId });
      await srv.getUserEntities();
      const res = await srv
        .match({ fieldsProjection: { status: 1 } })
        .add([
          {
            $group: {
              _id: null,
              draft: { $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] } },
              planned: {
                $sum: { $cond: [{ $eq: ["$status", "planned"] }, 1, 0] }
              },
              completed: {
                $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
              },
              started: {
                $sum: { $cond: [{ $eq: ["$status", "started"] }, 1, 0] }
              }
            }
          }
        ])
        .fetchDirect();
      const { _id, ...stats } = res[0] || {};
      count = stats;
    }

    // to do  : add mogo aggregation for this count if not on remote db
    count.datetime = datetime;
    shipmentCounts[accountId] = count;
    return count;
  }
});
