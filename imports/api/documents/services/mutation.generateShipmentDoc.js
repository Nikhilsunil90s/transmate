import { shipmentAggregation } from "/imports/api/shipments/services/query.pipelineBuilder";
import { Shipment } from "/imports/api/shipments/Shipment";
import { generateShipmentDocument } from "./generateDocs";

const debug = require("debug")("documents:resolvers");

export const generateShipmentDoc = ({ accountId, userId }) => ({
  userId,
  accountId,
  async generateDocument({ type, shipmentId }) {
    this.shipmentId = shipmentId;
    debug("generate doc %s, for shipmentId %s", type, shipmentId);

    const shipment = await Shipment.first(shipmentId);
    this.res = await generateShipmentDocument(
      {
        shipmentId,
        templateName: type,
        data: shipment,
        link: {
          shipmentId
        }
      },
      { accountId, userId }
    );

    return this;
  },
  async getClientResponse() {
    const srv = shipmentAggregation({ accountId: this.accountId })
      .matchId({ shipmentId: this.shipmentId })
      .match({ options: { noAccountFilter: true }, fieldsProjection: {} })
      .getDocuments();

    const res = await srv.fetchDirect();

    return res[0] || {};
  }
});
