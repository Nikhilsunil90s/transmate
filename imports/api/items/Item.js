import { Mongo } from "meteor/mongo";

import Model from "../Model";
import { ItemSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/item";

import { Shipment } from "/imports/api/shipments/Shipment";

class Item extends Model {
  static create(attr, validate = true) {
    if (validate) {
      return super.create(attr);
    }
    const id = this._collection.insert(attr, {
      validate: false
    });
    return this.after_create(this.first(id));
  }

  // eslint-disable-next-line camelcase
  static after_create(obj) {
    obj.shipment().push({
      itemIds: obj._id
    });
    return obj;
  }

  destroy() {
    this.shipment().pull({
      itemIds: this.getId()
    });
    return super.destroy();
  }

  shipment() {
    return Shipment.first(this.shipmentId);
  }
}

Item._collection = new Mongo.Collection("items");

Item.UNITS = {
  VOLUME: ["pal", "kg", "m3", "lm", "l", "ft3"],
  WEIGHT: ["kg", "pound", "ton", "mton"],
  QUANTITY: ["pcs", "l", "gal", "roll", "box", "pal"],
  DIMENSION: ["m", "cm", "ft", "inch"]
};

Item._collection.attachSchema(ItemSchema);
Item._collection = Item.updateByAt(Item._collection);
export { Item };
