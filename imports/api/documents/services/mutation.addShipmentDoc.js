import { shipmentAggregation } from "/imports/api/shipments/services/query.pipelineBuilder";
import { addDocument } from "./documentUtils";

export const addShipmentDocument = ({ accountId, userId }) => ({
  userId,
  accountId,
  async addDocument({ link, data }) {
    this.shipmentId = link.shipmentId;
    await addDocument({ accountId, userId }).add({ link, data });
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
