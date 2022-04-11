import { Mongo } from "meteor/mongo";
import Model from "../Model.js";
import { ShipmentsViewSchema } from "../_jsonSchemas/simple-schemas/collections/shipments-view.js";

class ShipmentsView extends Model {
  // eslint-disable-next-line camelcase
  static before_create(obj) {
    delete obj.createdAt;
    return obj;
  }
}

ShipmentsView._collection = new Mongo.Collection("shipments.views");

ShipmentsView._collection.attachSchema(ShipmentsViewSchema);
ShipmentsView._collection = ShipmentsView.updateByAt(ShipmentsView._collection);
export { ShipmentsView };
