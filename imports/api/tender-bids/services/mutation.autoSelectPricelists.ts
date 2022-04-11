import { TenderBid } from "../TenderBid";
import { TenderBidData } from "/imports/api/tender-bids-data/TenderBidData";
import { TenderBidType } from "../interfaces/tenderBid";
import { PriceList } from "/imports/api/pricelists/PriceList";

interface AutoSelectPriceLists {
  accountId: string;
  userId: string;
  tenderBidId?: string;
  init: (
    this: AutoSelectPriceLists,
    a: { tenderBidId: string }
  ) => Promise<AutoSelectPriceLists>;
  select: (this: AutoSelectPriceLists) => Promise<AutoSelectPriceLists>;
  // eslint-disable-next-line no-undef
  getUIResponse: () => Partial<TenderBidType>;
}

export const autoSelectPriceLists = ({
  accountId,
  userId
}): AutoSelectPriceLists => ({
  accountId,
  userId,
  async init({ tenderBidId }) {
    this.tenderBidId = tenderBidId;
    const { accountId: tenderBidAccountId } = await TenderBid.first(
      tenderBidId,
      {
        fields: { accountId: 1 }
      }
    );

    // FIXME: add this in a clean security class:
    if (tenderBidAccountId !== this.accountId) throw new Error("Not allowed");
    return this;
  },
  async select() {
    // 1. get countries
    const toCountryCodes = await TenderBidData._collection
      .rawCollection()
      .distinct("lanesToCountry.mapping", { tenderBidId: this.tenderBidId });
    const priceListIds = await PriceList._collection
      .rawCollection()
      .distinct("_id", {
        creatorId: this.accountId,
        customerId: this.accountId,
        status: "active",
        "lanes.to.zones.CC": { $in: toCountryCodes }
      });

    // 2. store

    await TenderBid._collection.update(
      { _id: this.tenderBidId },
      { $set: { "settings.priceListIds": priceListIds } }
    );
    return this;
  },
  getUIResponse() {
    return TenderBid.first(this.tenderBidId, { fields: { settings: 1 } });
  }
});
