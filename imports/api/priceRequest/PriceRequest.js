import { Mongo } from "meteor/mongo";
import Model from "../Model";
import get from "lodash.get";
import moment from "moment";
import businessDays from "/imports/api/_jsonSchemas/simple-schemas/_utilities/businessDays";

// collections
import { PriceRequestSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/price-request";

// const debug = require("debug")("priceRequest:db");
function getReference(obj) {
  return `${moment(get(obj, "created.at") || new Date()).format(
    "MMDD"
  )}-${obj._id.slice(-3).toUpperCase()}`;
}
class PriceRequest extends Model {
  // eslint-disable-next-line camelcase
  static before_create(obj) {
    const newObj = obj;

    if (!newObj.status) {
      newObj.status = "draft";
    }

    if (!newObj.dueDate) {
      newObj.dueDate = businessDays();
    }
    return newObj;
  }

  // eslint-disable-next-line camelcase
  static after_save(obj) {
    // set a default title
    if (!obj.title) {
      obj.update({ title: `PR ${getReference(obj)}` });
    }
  }

  ref() {
    return getReference(this);
  }

  static ref(obj) {
    return getReference(obj);
  }
}

PriceRequest._collection = new Mongo.Collection("price.request");
PriceRequest._collection.attachSchema(PriceRequestSchema);
PriceRequest._collection = PriceRequest.updateByAt(PriceRequest._collection);

// keep track of changes!
PriceRequest._collection = PriceRequest.storeChanges(PriceRequest._collection);
export { PriceRequest };
