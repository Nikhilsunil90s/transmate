import { Mongo } from "meteor/mongo";
import Model from "../Model.js";
import { ByAtSchema } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/_all.js";

class Workflow extends Model {
  // eslint-disable-next-line camelcase
  static before_create(obj) {
    delete obj.createdAt;
    obj.created = ByAtSchema.clean({});
    return obj;
  }

  // eslint-disable-next-line camelcase
  static before_save(obj) {
    obj.updated = ByAtSchema.clean({});
    return obj;
  }
}

Workflow._collection = new Mongo.Collection("bpmn.workflows");

// TenderDetail._collection = TenderDetail.updateByAt(TenderDetail._collection);

export { Workflow };
