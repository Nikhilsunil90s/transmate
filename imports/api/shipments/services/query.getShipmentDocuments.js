import { shipmentAggregation } from "./query.pipelineBuilder";

const debug = require("debug")("shipment:documents:query");

export const getShipmentDocuments = ({ accountId }) => ({
  accountId,
  async get({ shipmentId }) {
    const srv = shipmentAggregation({ accountId })
      .matchId({ shipmentId })
      .match({
        options: { noAccountFilter: true }, // use strict?
        fieldsProjection: {
          accountId: 1
        }
      })
      .getDocuments();

    const res = await srv.fetchDirect();
    debug("aggregation result %o", res);

    return res[0] || {};
  }
});
