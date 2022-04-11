import { PriceList } from "../PriceList";

const debug = require("debug")("pricelist:resolvers");

const MINIMAL_FIELDS = {
  creatorId: 1,
  clientId: 1,
  customerId: 1,
  carrierId: 1,
  status: 1,
  lanes: 1,
  defaultLeadTime: 1
};

export const leadTimesCopyLanes = ({ accountId, userId }) => ({
  accountId,
  userId,
  async init({ priceListId }) {
    this.priceListId = priceListId;
    this.priceList = await PriceList.first(priceListId, {
      fields: MINIMAL_FIELDS
    });
    if (!this.priceList) throw new Error("No document found");
    if (this.priceList.lanes?.length === 0) throw new Error("No lanes to copy");
    return this;
  },
  async copyLanes() {
    const leadTimes = this.priceList.lanes.map(lane => ({
      lane,
      ...this.priceList.defaultLeadTime
    }));

    debug("new leadTimes", leadTimes);
    await this.priceList.update({ leadTimes });
    return this;
  },
  getUIresponse() {
    return PriceList.first(this.priceListId, { fields: { leadTimes: 1 } });
  }
});
