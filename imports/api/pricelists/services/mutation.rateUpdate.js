import { Mongo } from "meteor/mongo";
import SecurityChecks from "/imports/utils/security/_security.js";
import { PriceList } from "../PriceList";
import { PriceListRate } from "../PriceListRate";
import { PriceListRateSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/price-list-rate";

export const priceListRateUpdate = ({ accountId, userId }) => ({
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
  async upsert({ id, update }) {
    if (!update) {
      await PriceListRate._collection.remove({ _id: new Mongo.ObjectID(id) });
    } else {
      const modifier = PriceListRateSchema.clean(
        { $set: { ...update, priceListId: this.priceListId } },
        {
          trimStrings: true,
          getAutovalues: false,
          isModifier: true,
          mutate: true
        }
      );
      if (id) {
        this.res = await PriceListRate._collection.update(
          { _id: new Mongo.ObjectID(id) },
          modifier
        );
      } else {
        this.res = await PriceListRate._collection.insert(modifier.$set);
      }
    }
    return this;
  },
  getUIResponse() {
    return this.res;
  }
});
