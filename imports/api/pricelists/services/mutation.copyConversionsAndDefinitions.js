/* eslint-disable camelcase */
import SecurityChecks from "/imports/utils/security/_security.js";
import { PriceList } from "../PriceList";

export const priceListCopyConversionsAndDefinitions = ({
  accountId,
  userId
}) => ({
  accountId,
  userId,
  async init({ priceListId }) {
    this.priceListId = priceListId;
    this.priceList = await PriceList.first(priceListId, {
      fields: { _id: 1 }
    });
    SecurityChecks.checkIfExists(this.priceList);
    return this;
  },
  runChecks() {
    // FIXME - check if allowed
    return this;
  },
  async copy({ sourcePriceListId }) {
    const { uoms, definitions } = await PriceList.first(sourcePriceListId, {
      fields: { uoms: 1, definitions: 1 }
    });

    if (Object.keys({ uoms, definitions }).length > 0) {
      await this.priceList.update_async({ uoms, definitions });
    }
    return this;
  },
  getUIResponse() {
    return this.priceList.reload({
      fields: { uoms: 1, definitions: 1 }
    });
  }
});
