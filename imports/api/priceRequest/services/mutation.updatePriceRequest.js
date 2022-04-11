import { priceRequestService } from "./priceRequest";

export const updatePriceRequest = ({ accountId, userId }) => ({
  accountId,
  userId,
  async init({ priceRequestId }) {
    this.priceRequestSrv = priceRequestService({
      accountId: this.accountId,
      userId: this.userId
    });
    await this.priceRequestSrv.init({ priceRequestId });
    return this;
  },
  async update({ update }) {
    await this.priceRequestSrv.update_async(update);
    return this;
  },
  getUIResponse() {
    return this.priceRequestSrv.get();
  }
});
