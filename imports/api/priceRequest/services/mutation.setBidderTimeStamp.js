import SecurityChecks from "/imports/utils/security/_security";
import { priceRequestBidService } from "./priceRequestBid";
import { PriceRequest } from "../PriceRequest";

export const setBidderTimeStamp = ({ accountId, userId }) => ({
  accountId,
  userId,
  async init({ priceRequestId }) {
    this.priceRequest = await PriceRequest.first(priceRequestId);
    SecurityChecks.checkIfExists(this.priceRequest);
    return this;
  },
  async setTS() {
    priceRequestBidService({
      priceRequest: this.priceRequest,
      accountId: this.accountId
    })
      .getMyBid()
      .setTimeStamps();
  }
});
