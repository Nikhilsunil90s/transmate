import { shipmentAggregation } from "./query.pipelineBuilder";

const debug = require("debug")("shipment:getLinks");

export const getShipmentLinks = ({ accountId }) => ({
  accountId,
  async get({ shipmentId }) {
    const srv = shipmentAggregation({ accountId })
      .matchId({ shipmentId })
      .match({
        options: { noAccountFilter: true }, // use strict?
        fieldsProjection: {
          priceRequestId: 1,
          shipmentProjectInboundId: 1,
          shipmentProjectOutboundId: 1
        }
      })
      .getLinks();
    const res = await srv.fetchDirect();

    debug("aggregation result %o", res);

    return res[0] || {};
  }
});
