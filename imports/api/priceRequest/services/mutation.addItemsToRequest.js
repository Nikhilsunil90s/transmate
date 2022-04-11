import get from "lodash.get";
import { priceRequestService } from "./priceRequest";
import { shipmentAggregation } from "/imports/api/shipments/services/query.pipelineBuilder";

export const addItemsToRequest = ({ accountId, userId }) => ({
  accountId,
  userId,
  shipmentIds: [],
  async init({ priceRequestId }) {
    this.priceRequestSrv = priceRequestService({
      accountId: this.accountId,
      userId: this.userId
    });
    await this.priceRequestSrv.init({ priceRequestId });
    return this;
  },
  async add({ items }) {
    await this.priceRequestSrv.verifyItems({ items });
    await this.priceRequestSrv.addItems();
    return this;
  },
  async getUIResponse() {
    const { errors, validItems = [] } = this.priceRequestSrv;
    const priceRequestDoc = await this.priceRequestSrv.get();
    const allShipmentIds = (priceRequestDoc.items || []).map(
      ({ shipmentId }) => shipmentId
    );

    // return shipment for shipment cache update:
    const srv = shipmentAggregation({
      accountId: this.accountId,
      userId: this.userId
    });
    srv
      .match({
        query: [{ _id: { $in: allShipmentIds } }],
        options: { noStatusFilter: true, noAccountFilter: true },
        fieldsProjection: {
          priceRequestId: 1
        }
      })
      .getLinks(); // will set linkInbound [], linkOutbound: [] etc... resolver sets this straight

    const shipments = await srv.fetchDirect();
    return {
      priceRequestId: get(priceRequestDoc, "_id"),
      priceRequest: priceRequestDoc,
      errors,
      validItems: validItems.length,
      shipments
    };
  }
});
