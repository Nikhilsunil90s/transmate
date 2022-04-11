import { shipmentAggregation } from "./query.pipelineBuilder";

const debug = require("debug")("shipment:getcosts");

export const getShipmentCosts = ({ accountId, userId }) => ({
  accountId,
  userId,
  async get({ shipmentId, invoiceId }) {
    const srv = shipmentAggregation({ accountId, userId });
    await srv.getUserEntities();
    srv
      .matchId({ shipmentId })
      .match({
        fieldsProjection: {
          accountId: 1,
          status: 1,
          carrierIds: 1,
          costs: 1, // costs
          costParams: 1, // costs
          created: 1 // costs
        }
      })
      .getCostExchangeRates({})
      .getCostDescriptions()
      .getInvoiceHeaders({ invoiceId });

    const res = await srv.fetchDirect();
    debug("aggregation result %o", res);

    return res[0] || {};
  }
});
