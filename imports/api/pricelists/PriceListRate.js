import { Mongo } from "meteor/mongo";
import Model from "../Model";
import { PriceListRateSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/price-list-rate";

const debug = require("debug")("price-list:db");

class PriceListRate extends Model {
  // eslint-disable-next-line camelcase
  static before_save(obj) {
    debug("before save pricelistrate obj : %o", obj);

    // set laneId name on object to facilitate index.
    const ruleWithLaneId = (obj.rules || []).find(o => o.laneId != null) || {
      laneId: null
    };

    // return rule with laneId rule and set laneId on root level ,default value is null
    obj.laneId = ruleWithLaneId.laneId;
    return obj;
  }
}

PriceListRate._collection = new Mongo.Collection("price.list.rate", {
  idGeneration: "MONGO"
});
PriceListRate._collection.attachSchema(PriceListRateSchema);
PriceListRate._collection = PriceListRate.updateByAt(PriceListRate._collection);
export { PriceListRate };
