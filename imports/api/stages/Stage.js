import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import get from "lodash.get";
import moment from "moment";
import Model from "../Model";

// data
import { Address } from "/imports/api/addresses/Address";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { Shipment } from "/imports/api/shipments/Shipment";
import { StageSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/stage";
import { STAGE_DEFAULTS } from "/imports/api/_jsonSchemas/enums/stage";

class Stage extends Model {
  static create(attr, validate = true) {
    if (validate) {
      return super.create(attr);
    }
    this.before_create(attr);
    const id = this._collection.insert(attr, {
      validate: false
    });
    return this.after_create(this.first(id));
  }

  // eslint-disable-next-line camelcase
  static before_create(obj) {
    delete obj.createdAt;
    const newObj = {
      ...STAGE_DEFAULTS,
      ...obj
    };

    if (get(newObj, ["from", "latLng"]) && get(newObj, ["to", "latLng"])) {
      newObj.sphericalDistance = Address.getDistance(
        newObj.from.latLng,
        newObj.to.latLng
      );
    }

    return newObj;
  }

  static async updateShipment(obj) {
    if (!obj.shipmentId) throw Error("shipmentId does not exist!");
    if (obj.before) {
      // code will continue!
      const shipment = await Shipment.first(obj.shipmentId, {
        fields: { stageIds: 1 }
      });

      return Shipment._collection.update(this.shipmentId, {
        $push: {
          stageIds: {
            $each: [obj._id],
            $position: shipment.stageIds.indexOf(obj.before)
          }
        }
      });
    }

    return Shipment._collection.update(obj.shipmentId, {
      $addToSet: { stageIds: obj._id }
    });
  }

  // eslint-disable-next-line camelcase
  static after_create(obj) {
    this.updateShipment(obj);
    return obj;
  }

  // eslint-disable-next-line camelcase
  static before_save(obj) {
    if (
      obj["dates.pickup.arrival.planned"] &&
      obj["dates.delivery.arrival.planned"]
    ) {
      if (
        obj["dates.pickup.arrival.planned"] >
        obj["dates.delivery.arrival.planned"]
      ) {
        throw new Meteor.Error(
          "dates",
          "Delivery date needs to be after pickup date."
        );
      }
    }
    return obj;
  }

  // eslint-disable-next-line camelcase
  static async after_save_async(obj) {
    let distance;
    const shipment = await obj.getShipment();
    if (obj.carrierId != null) {
      // Update the carriers array on the shipment
      await shipment.refreshCarriers();
    }

    // Calculate distance for old stages (normally already done on creation)
    if (
      get(obj, ["from", "latLng"]) &&
      get(obj, ["to", "latLng"]) &&
      obj.sphericalDistance == null
    ) {
      distance = Address.getDistance(obj.from.latLng, obj.to.latLng);
      await obj.update({ sphericalDistance: distance });
    }

    // Update shipment distance
    await shipment.refreshDistance();

    // This means a regular (validated) update has gone through; clear the errors
    if (get(obj, ["edi", "error"])) {
      await this._collection.update(obj._id, {
        $unset: {
          "edi.error": ""
        }
      });
      await shipment.clearError("Stage", obj._id);
    }
  }

  async destroy() {
    const shipment = await this.getShipment();
    shipment.pull({ stageIds: this.getId() });
    return super.destroy_async();
  }

  async getShipment(options) {
    // we buffer it, in case it is needed again
    this.shipment =
      this.shipment || (await Shipment.first(this.shipmentId, options));
    return this.shipment;
  }

  carrier() {
    return AllAccounts.first({ _id: this.carrierId });
  }

  // todo: Notify carrier
  async isReadyForRelease(checkSpecific) {
    const problems = [];
    const shipment = await this.getShipment();
    const hasItems = await shipment.hasNestedItems();

    if (this.status !== "draft") {
      problems.push("status");
    }
    if (!shipment.shipperId) {
      problems.push("shipper");
    }
    if (!hasItems) {
      problems.push("items");
    }
    if (!(this.from && this.to)) {
      problems.push("fields");
      problems.push("fields - from & to");
    }
    if (!this.carrierId) {
      problems.push("carrierId");
    }
    if (
      !(
        get(this.dates, ["pickup", "arrival", "planned"]) &&
        get(this.dates, ["delivery", "arrival", "planned"])
      )
    ) {
      problems.push("fields");
      problems.push("fields - dates");
    }
    if (checkSpecific) {
      return problems.indexOf(checkSpecific) === -1;
    }
    return { problems, pass: problems.length === 0 };
  }

  addDelay(minutes) {
    const updates = {};

    // Push the planned date forward for all the stops that have not happened yet
    [("pickup", "delivery")].forEach(a => {
      return ["arrival", "start", "end", "documents", "departure"].forEach(
        b => {
          if (
            get(this, ["dates", a, b, "planned"]) &&
            !get(this, ["dates", a, b, "actual"])
          ) {
            let m = moment(get(this, ["dates", a, b, "planned"]));
            m = m.add(minutes, "minutes");
            updates[`dates.${a}.${b}.planned`] = m.toDate();
          }
        }
      );
    });

    if (Object.keys(updates).length === 0) {
      return this;
    }

    return this.update(updates);
  }
}

Stage._collection = new Mongo.Collection("stages");

Stage._collection.attachSchema(StageSchema);
Stage._collection = Stage.updateByAt(Stage._collection);

// keep track of changes!
Stage._collection = Stage.storeChanges(Stage._collection);
export { Stage };
