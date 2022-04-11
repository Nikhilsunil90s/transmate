import SecurityChecks from "/imports/utils/security/_security";

import { PriceRequest } from "../PriceRequest";
import { priceRequestBidService } from "./priceRequestBid";

// const debug = require("debug")("price-request:resolver");

/** editBid
 */
export const editBid = ({ accountId, userId }) => ({
  accountId,
  userId,
  async init({ priceRequestId }) {
    this.priceRequestId = priceRequestId;
    this.priceRequest = await PriceRequest.first(priceRequestId);
    SecurityChecks.checkIfExists(this.priceRequest);
    return this;
  },
  async update({ update }) {
    this.srv = priceRequestBidService({
      priceRequest: this.priceRequest,
      accountId
    }).getMyBid();
    await this.srv.check();
    await this.srv.editBid({ update });
    return this;
  },
  getUIResponse() {
    return this.srv.getPriceRequest();
  }
});
