/* eslint-disable camelcase */
import SecurityChecks from "/imports/utils/security/_security.js";
import { PriceList } from "../PriceList";
import { PriceListRate } from "../PriceListRate";

export const priceListCopyAdditionalRates = ({ accountId, userId }) => ({
  accountId,
  userId,
  async init({ priceListId }) {
    this.priceListId = priceListId;
    this.priceList = await PriceList.first(priceListId, {
      fields: { _id: 1, charges: 1, volumes: 1 } // charges, volumes needed for structure check
    });
    SecurityChecks.checkIfExists(this.priceList);
    return this;
  },
  async copy({ sourcePriceListId }) {
    const sourceRates = await PriceListRate.where({
      priceListId: sourcePriceListId,
      "meta.source": { $ne: "table" }
    });

    if (sourceRates.length) {
      const ratesToInsert = sourceRates.map(
        ({ __is_new, _id, id, ...rate }) => ({
          ...rate,
          priceListId: this.priceListId
        })
      );
      await PriceListRate._collection.rawCollection().insertMany(ratesToInsert);
    }
    return this;
  },
  getUIResponse() {
    return this.res;
  }
});
