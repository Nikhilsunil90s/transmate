import { Invoice } from "/imports/api/invoices/Invoice";
import { shipmentAggregation } from "../../shipments/services/query.pipelineBuilder";

// const debug = require("debug")("invoice:uninvoicedShipments");

export const uninvoicedShipments = ({ accountId }) => ({
  accountId,
  async get({ invoiceId }) {
    const { sellerId, clientId, amount = {} } = await Invoice.first(invoiceId, {
      fields: { sellerId: 1, clientId: 1, amount: 1 }
    });

    const srv = shipmentAggregation({ accountId })
      .match({
        query: [
          {
            accountId: clientId,
            carrierIds: sellerId,
            status: { $nin: ["draft", "canceled"] },
            flags: { $ne: "has-invoice" }, // ??? or per item?
            $nor: [
              { costs: { $exists: false } },
              { costs: { $size: 0 } } // at least 1 entry
            ]
          }
        ],
        options: { noAccountFilter: true },
        fieldsProjection: {
          id: "$_id",
          number: 1,
          references: 1,
          pickup: 1,
          delivery: 1,
          costs: 1, // costs
          costParams: 1, // costs
          created: 1 // costs
        }
      })
      .getAddressAnnotation({ stop: "pickup" })
      .getAddressAnnotation({ stop: "delivery" })
      .getCostExchangeRates({ currency: amount.currency })
      .getCostDescriptions();

    const shipments = await srv.fetch();

    // debug(JSON.stringify(srv.pipeline));
    // console.dir(shipments[0], { depth: null });
    return shipments;
  }
});
