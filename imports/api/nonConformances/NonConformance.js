import { Mongo } from "meteor/mongo";
import Model from "../Model";
import { Shipment } from "/imports/api/shipments/Shipment";
import { NonConformanceSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/non-conformance";

class NonConformance extends Model {
  // eslint-disable-next-line camelcase
  static before_create(obj) {
    return obj;
  }

  // eslint-disable-next-line camelcase
  static async after_create(obj) {
    const shipment = await obj.getShipment();
    await shipment.push({
      nonConformanceIds: obj._id
    });
    return obj;
  }

  async destroy() {
    const shipment = await this.getShipment();
    await shipment.pull({
      nonConformanceIds: this.getId()
    });
    return super.destroy_async();
  }

  getShipment() {
    return Shipment.first(this.shipmentId);
  }
}

NonConformance._collection = new Mongo.Collection("shipment.nonconformances");

NonConformance._collection.attachSchema(NonConformanceSchema);
NonConformance._collection = NonConformance.updateByAt(
  NonConformance._collection
);
export { NonConformance };
