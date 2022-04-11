/* eslint-disable camelcase */
import { Mongo } from "meteor/mongo";
import { ShipmentProjectSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/shipment-projects";
import Model from "../Model";

class ShipmentProject extends Model {}

ShipmentProject._collection = new Mongo.Collection("shipment.project");
ShipmentProject._collection.attachSchema(ShipmentProjectSchema);
ShipmentProject._collection = ShipmentProject.updateByAt(
  ShipmentProject._collection
);

export { ShipmentProject };
