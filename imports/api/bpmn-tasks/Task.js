import { Mongo } from "meteor/mongo";
import Model from "../Model.js";
import { ByAtSchema } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/_all.js";

class Task extends Model {
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

Task._collection = new Mongo.Collection("bpmn.tasks");

// TenderDetail._collection = TenderDetail.updateByAt(TenderDetail._collection);

export { Task };
