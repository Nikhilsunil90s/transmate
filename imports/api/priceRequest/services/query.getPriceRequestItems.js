import { PriceRequest } from "../PriceRequest";
import { shipmentAggregation } from "../../shipments/services/query.pipelineBuilder";

const MAX_ITEM_DEPTH = 1;

const debug = require("debug")("price-request:resolver");

export const getPriceRequestItems = ({ accountId, userId }) => ({
  accountId,
  userId,
  async get({ priceRequestId }) {
    const priceRequest = await PriceRequest.first(
      { _id: priceRequestId },
      { fields: { items: 1, customerId: 1 } }
    );

    const { items = [], customerId: prAccountId } = priceRequest || {};

    const shipmentIds = items.map(({ shipmentId }) => shipmentId);

    const shipments = await shipmentAggregation({ accountId: prAccountId })
      .match({
        query: [{ _id: { $in: shipmentIds } }],
        options: { noAccountFilter: true }
      })
      .getAccountData({ partner: "shipper" })
      .getAddressAnnotation({ stop: "pickup" })
      .getAddressAnnotation({ stop: "delivery" })
      .getItems({ depth: MAX_ITEM_DEPTH })
      .getStages({})
      .fetchDirect();

    debug("getPriceRequestItems return %s items", shipments.length);

    return shipments;
  }
});
