/* eslint-disable camelcase */
import { Mongo } from "meteor/mongo";

import Model from "../Model";

import { SHIPMENT_ITEMS_DEFAULTS } from "/imports/api/_jsonSchemas/enums/shipmentItems.js";
import { Shipment } from "/imports/api/shipments/Shipment";
import { ShipmentItemSchema } from "../_jsonSchemas/simple-schemas/collections/shipment-item";

class ShipmentItem extends Model {
  static create(attr, validate = true) {
    const newObj = {
      ...SHIPMENT_ITEMS_DEFAULTS,
      ...attr
    };
    if (validate) {
      return super.create(newObj);
    }
    const id = this._collection.insert(newObj, {
      validate: false
    });
    return this.after_create(this.first(id));
  }

  static async create_async(attr, validate = true) {
    const newObj = {
      ...SHIPMENT_ITEMS_DEFAULTS,
      ...attr
    };
    if (validate) {
      return super.create_async(newObj);
    }
    const itemId = await this._collection.insert(newObj, {
      validate: false
    });

    return this.first(itemId);
  }

  shipment() {
    return Shipment.first(this.shipmentId);
  }
}

ShipmentItem._collection = new Mongo.Collection("shipment.items");
ShipmentItem._collection.attachSchema(ShipmentItemSchema);
ShipmentItem._collection = ShipmentItem.updateByAt(ShipmentItem._collection);

// keep track of changes!
ShipmentItem._collection = ShipmentItem.storeChanges(ShipmentItem._collection);
export { ShipmentItem };
