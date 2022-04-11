import { PriceList } from "/imports/api/pricelists/PriceList";

const debug = require("debug")("price-list:service");

// collections

class PriceListService {
  static updatePriceList({ updates, priceList }) {
    debug("pricelist %s updates %j", priceList._id, updates);
    if (
      updates.template &&
      updates.template.type &&
      updates.template.type === "custom"
    ) {
      // temporary fix until gui has custom option, leave custom as is
      // eslint-disable-next-line no-param-reassign
      delete updates.template;
    }

    if (updates.volumes) {
      updates["uoms.allowed"] = [
        ...new Set([
          ...updates.volumes?.map(({ uom }) => uom),
          ...(priceList.uoms?.conversions || []).map(({ from: { uom } }) => uom)
        ])
      ];
    }

    return PriceList._collection.update(priceList._id, { $set: updates });

    // return priceList.update(updates);
  }
}

export { PriceListService };
