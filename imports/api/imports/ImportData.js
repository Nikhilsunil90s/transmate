import { Mongo } from "meteor/mongo";

import Model from "../Model";

// data

class ImportData extends Model {
  // eslint-disable-next-line camelcase
  static before_create(obj) {
    delete obj.createdAt;
    return obj;
  }
}

ImportData._collection = new Mongo.Collection("imports.data");

// Import._collection = Import.updateByAt(Import._collection);
export { ImportData };
