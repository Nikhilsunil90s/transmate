import { shipmentAggregation } from "./query.pipelineBuilder";

const debug = require("debug")("shipment:getcosts");

export const getShipmentInfoHeader = ({ accountId, userId }) => ({
  accountId,
  userId,
  async get({ shipmentId }) {
    const srv = shipmentAggregation({ accountId })
      .matchId({ shipmentId })
      .match({
        options: { noAccountFilter: true, noStatusFilter: true },
        fieldsProjection: {
          number: 1,
          status: 1,
          tracking: 1
        }
      })
      .getStages({ fields: { dates: 1 } })
      .getLastStage()
      .add([{ $addFields: { eta: "$lastStage.dates.eta" } }]);

    const res = await srv.fetchDirect();
    debug("aggregation result %o", res);

    return res[0] || {};
  }
});
