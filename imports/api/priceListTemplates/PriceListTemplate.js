import { Mongo } from "meteor/mongo";
import Model from "../Model";

class PriceListTemplate extends Model {}

PriceListTemplate._collection = new Mongo.Collection("price.list.template");

// PriceListTemplate._collection.attachSchema(PriceListSchema);
PriceListTemplate._collection = PriceListTemplate.updateByAt(
  PriceListTemplate._collection
);
export { PriceListTemplate };
