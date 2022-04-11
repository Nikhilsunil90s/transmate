import { Document } from "/imports/api/documents/Document";
import { shipmentAggregation } from "/imports/api/shipments/services/query.pipelineBuilder";

export const removeShipmentDocument = ({ accountId, userId }) => ({
  userId,
  accountId,
  async removeDocument({ documentId, shipmentId }) {
    this.shipmentId = shipmentId;
    const document = await Document.first({ _id: documentId });
    if (!document) throw new Error("Document does not exist");

    await document.destroy_async();
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
