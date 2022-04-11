import { Shipment } from "/imports/api/shipments/Shipment";
import { PriceRequest } from "/imports/api/priceRequest/PriceRequest";

export const getPriceRequestSummary = ({ accountId, userId }) => ({
  accountId,
  userId,
  async get({ shipmentId }) {
    const shipment = await Shipment.first(shipmentId, {
      fields: { priceRequestId: 1 }
    });
    if (typeof shipment !== "object" || !shipment.priceRequestId) return null;
    const priceRequest = await PriceRequest.first(
      { _id: shipment.priceRequestId },
      {
        fields: {
          customerId: 1,
          creatorId: 1,
          status: 1,
          dueDate: 1,
          bidders: 1
        }
      }
    );
    const { bidders = [], ...data } = priceRequest || {};

    const bids = bidders.reduce((acc, cur) => {
      let accMod = acc;
      if (
        (cur.simpleBids || []).some(
          ({ shipmentId: shipId }) => shipId === shipmentId
        )
      ) {
        accMod += 1;
      }
      return accMod;
    }, 0);

    return {
      ...data,
      bids,
      biddersInRequest: bidders.length
    };
  }
});
