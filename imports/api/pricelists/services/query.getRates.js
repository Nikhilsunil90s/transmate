import { PriceListRate } from "../PriceListRate";
import { toRules } from "/imports/utils/priceList/fnPriceListHelpers.js";

const ITEM_LIMIT = 10000;

export const getRates = ({ accountId, userId }) => ({
  accountId,
  userId,
  get({ priceListId, query = {}, inGrid }) {
    const rules = toRules(query);
    const dbQuery = {
      ...(inGrid
        ? { "meta.source": "table" }
        : { "meta.source": { $ne: "table" } }),
      ...rules,
      priceListId
    };
    const cursor = PriceListRate.find(dbQuery, { limit: ITEM_LIMIT });

    return {
      rates: cursor.fetch(),
      stats: {
        totalCount: cursor.count({ priceListId }), // all items
        queryCount: cursor.count(false), // ignore the limit
        curCount: cursor.count()
      }
    };
  }
});
