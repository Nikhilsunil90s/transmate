import { shipmentAggregation } from "./query.pipelineBuilder";
import { shipmentPublicFields } from "/imports/api/shipments/services/fixtures";

const debug = require("debug")("shipment:getShipment");

export const getShipmentTrackingInfo = () => ({
  async get({ shipmentId }) {
    const srv = shipmentAggregation({})
      .matchId({ shipmentId })
      .match({
        options: { noAccountFilter: true },
        fieldsProjection: {
          id: "$_id",
          ...shipmentPublicFields
        }
      });
    const res = await srv.fetchDirect();
    debug("aggregation result %o", res);

    return res[0] || {};
  }
});
