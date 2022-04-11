import { _ } from "meteor/underscore";
import { Mongo } from "meteor/mongo";
import Model from "../Model";
import { FuelIndexSchema } from "../_jsonSchemas/simple-schemas/collections/fuel-index";

class FuelIndex extends Model {
  // eslint-disable-next-line camelcase
  static before_create(obj, context) {
    delete obj.createdAt;
    if (!obj.created) {
      obj.created = {
        by: context.userId,
        at: new Date()
      };
    }

    if (!obj.accountId) {
      obj.accountId = context.accountId;
    }
    return obj;
  }

  // eslint-disable-next-line consistent-return
  getFuel(month, year) {
    const lookup = {
      month: parseInt(month, 10),
      year: parseInt(year, 10)
    };
    const period = _.findWhere(this.periods, lookup);
    if (period) {
      return period.fuel;
    }
  }

  // eslint-disable-next-line consistent-return
  getIndex(month, year) {
    const lookup = {
      month: parseInt(month, 10),
      year: parseInt(year, 10)
    };
    const period = _.findWhere(this.periods, lookup);
    if (period) {
      return period.index;
    }
  }
}

FuelIndex._collection = new Mongo.Collection("fuel.indexes");

FuelIndex._collection.attachSchema(FuelIndexSchema);
FuelIndex._collection = FuelIndex.updateByAt(FuelIndex._collection);
export { FuelIndex };
