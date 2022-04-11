import SecurityChecks from "/imports/utils/security/_security";

import { PriceRequest } from "../PriceRequest";
import { priceRequestBidService } from "./priceRequestBid";
import { getPriceRequest } from "./query.getPriceRequest";

const debug = require("debug")("price-request:resolver");

/** placeSimpleBid
 * @param {String} priceRequestId id of the price request
 * @param {Array} chargeLines array of the charges & amount value and currency
 * @param {String} chargeLines.chargeId id of charge
 * @param {Object} chargeLines.amount
 * @param {Object} chargeLines.amount
 */
export const placeSimpleBid = ({ accountId, userId }) => ({
  accountId,
  userId,
  async init({ priceRequestId }) {
    this.priceRequestId = priceRequestId;
    this.priceRequest = await PriceRequest.first(priceRequestId);
    SecurityChecks.checkIfExists(this.priceRequest);
    return this;
  },
  async placeBid({ items }) {
    debug("update pr %s with items :%o", this.priceRequestId, items);
    const service = priceRequestBidService({
      priceRequest: this.priceRequest,
      accountId: this.accountId,
      userId: this.userId
    }).getMyBid();
    await service.check();

    // will create a priceList if it does not exist:
    if (!service.hasLinkedPriceList) {
      service.getTemplate({ type: "spot" });
      await service.copyPriceListTemplate({ context: "bid" });
      await service.linkBid();
    }
    debug("update offers");

    // will proceed and update offers:
    await Promise.all(
      items.map(({ chargeLines, notes, shipmentId }) =>
        service.editSimpleBid({ chargeLines, shipmentId, notes })
      )
    );
    debug("release offer");
    await service.releaseSimpleBid();

    return this;
  },
  async getUIResponse() {
    return getPriceRequest({ accountId, userId }).get({
      priceRequestId: this.priceRequestId
    });
  }
});
