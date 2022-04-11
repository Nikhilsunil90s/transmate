import { Mongo } from "meteor/mongo";
import Model from "../Model.js";
import { ByAtSchema } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/_all.js";
import { TenderDetailSchema } from "../_jsonSchemas/simple-schemas/collections/tender-detail.js";

class TenderDetail extends Model {
  // eslint-disable-next-line camelcase
  static before_create(obj) {
    delete obj.createdAt;
    return obj;
  }

  // eslint-disable-next-line camelcase
  static before_save(obj) {
    obj.updated = ByAtSchema.clean({});
    return obj;
  }
}

TenderDetail._collection = new Mongo.Collection("tenders.details");
TenderDetail._collection.attachSchema(TenderDetailSchema);
TenderDetail._collection = TenderDetail.updateByAt(TenderDetail._collection);
export { TenderDetail };
