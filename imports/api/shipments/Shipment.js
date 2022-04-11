/* eslint-disable camelcase */
import { _ } from "meteor/underscore";
import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";

import moment from "moment";
import get from "lodash.get";
import Model from "../Model";
import { oPath } from "../../utils/functions/path";
import { ShipmentSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/shipment";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { Address } from "/imports/api/addresses/Address";
import { ShipmentItem } from "/imports/api/items/ShipmentItem";
import { Stage } from "/imports/api/stages/Stage";
import { updateFlags } from "/imports/api/shipments/services/updateFlags";
import { SHIPMENT_DEFAULTS } from "/imports/api/_jsonSchemas/enums/shipment";
import { generateUniqueNumber } from "/imports/utils/functions/generateUniqueNumber";

const debug = require("debug")("shipment:class");

class Shipment extends Model {
  static async create_async(attr, validate = true) {
    attr.number = await generateUniqueNumber();
    this.before_create(attr);
    if (validate) {
      return super.create_async(attr);
    }

    const shipmentId = await this._collection.insert(attr, {
      validate: false
    });
    return this.first(shipmentId);
  }

  static before_create(obj) {
    const newObj = {
      ...SHIPMENT_DEFAULTS,
      ...obj
    };
    delete newObj.createdAt;

    newObj.updates = [
      {
        action: "created",
        userId: newObj.created.by,
        accountId: newObj.accountId,
        ts: new Date()
      }
    ];
    return newObj;
  }

  static after_create() {}

  static first(selector = {}, options = { fields: { edi: 0 } }) {
    // remove big keys if not asked for!
    return super.first(selector, options);
  }

  async addUpdate(action, data = {}, context = {}) {
    let accountId;
    let userId;

    try {
      userId = context.userId;
      accountId = context.accountId;
    } catch (error) {
      // do nothing
    }
    return this.push({
      updates: {
        action,
        ts: new Date(),
        data,
        ...(userId ? { userId } : undefined),
        ...(accountId ? { accountId } : undefined)
      }
    });
  }

  /** clears errors after stage save */
  async clearError(type, id) {
    // Clear subdocument error
    await this.pull({ "edi.error.subs": { type, id } });

    // Clear edi.error property if there aren't any more errors left
    const reloaded = await this.reload();
    if (
      !(
        oPath(["edi", "error", "fields", "length"], reloaded) ||
        oPath(["edi", "error", "subs", "length"], reloaded)
      )
    ) {
      await this.constructor._collection.update(reloaded._id, {
        $unset: { "edi.error": "" }
      });
    }
  }

  async refreshCarriers() {
    const carrierIds = new Set();
    const stages = await this.getStages();
    stages.map(({ carrierId }) => carrierIds.add(carrierId));

    this.save({ carrierIds: [...carrierIds] }); // async
    return [...carrierIds];
  }

  async refreshStatus() {
    const stages = await this.getStages();
    if (!stages || (stages && !stages.length)) {
      return;
    }
    switch (true) {
      case stages.every(stage => stage.status === "completed"): {
        // update sets also the actual date of the shipment
        const dateActualArrival = get(stages[stages.length - 1], [
          "dates",
          "delivery",
          "arrival",
          "actual"
        ]);
        await this.save_async({ status: "completed" });
        this.addUpdate("completed", {
          reason: "stages",
          action: "completed",
          ts: dateActualArrival
        });
        break;
      }
      case stages.some(stage => stage.status === "started"): {
        // should take the actual start date of the first stage
        const dateActualStart = get(stages[0], [
          "dates",
          "pickup",
          "arrival",
          "actual"
        ]);
        await this.save_async({ status: "started" });
        this.addUpdate("started", {
          reason: "stages",
          action: "started",
          ts: dateActualStart
        });
        break;
      }
      case stages.every(stage => stage.status === "planned"): {
        // should take the planned arrival date of the last stage:
        const datePlannedArrival = get(stages[stages.length - 1], [
          "dates",
          "delivery",
          "arrival",
          "planned"
        ]);
        this.save_async({ status: "planned" });
        this.addUpdate("planned", {
          reason: "stages",
          action: "planned",
          ts: datePlannedArrival
        });
        break;
      }
      case stages.some(stage => stage.status === "planned"): {
        // should take the planned arrival date of the last stage:
        const datePlannedArrival = get(stages[stages.length - 1], [
          "dates",
          "delivery",
          "arrival",
          "planned"
        ]);
        await this.save_async({ status: "partial" });
        this.addUpdate("planned", {
          reason: "stages",
          action: "planned",
          ts: datePlannedArrival
        });
        break;
      }
      case stages.some(stage => stage.status === "draft"):
        // check if shipment has already draft status , else update and add history
        if (this.status !== "draft") {
          await this.save_async({ status: "draft" });
          this.addUpdate("draft", { reason: "stages", action: "draft" });
        }
        break;
      default:
    }
  }

  async refreshDistance() {
    const stages = await this.getStages();
    const totalSphericalDistance = stages.reduce((a, b) => {
      return a + (b.sphericalDistance || 0);
    }, 0);

    // only update if there is a difference
    if (
      totalSphericalDistance &&
      this.sphericalDistance !== totalSphericalDistance
    ) {
      return this.update({
        sphericalDistance: totalSphericalDistance
      });
    }
    return null;
  }

  getShipper() {
    return AllAccounts.first({ _id: this.shipperId });
  }

  from() {
    return _.first(this.stages()).from;
  }

  to() {
    return _.last(this.stages()).to;
  }

  // This method returns the arrival date of a shipment, which we use to calculate
  // lead time in Price lists
  arrivalDate() {
    const stage = Stage.first(_.last(this.stageIds));
    return oPath(["dates", "delivery", "arrival", "planned"], stage);
  }

  // This is a method for getting a stage's carrier on shipment level. In the future,
  // individual stages can get unique carriers and this method will thus depreciate
  // used in aside, delayed email
  carrier() {
    const carrierId = oPath([0, "carrierId"], this.stages());

    if (!carrierId) {
      return;
    }
    // eslint-disable-next-line consistent-return
    return AllAccounts.first({ _id: carrierId });
  }

  getFirstCarrier() {
    return AllAccounts.first({ _id: oPath(["carrierIds", 0], this) });
  }

  getEquipment() {
    if (this.equipments && Array.isArray(this.equipments)) {
      return this.equipments[0];
    }
    return null;
  }

  stage() {
    const [firstStage] = this.stages() || [];
    return firstStage || {};
  }

  // Note again, that the stage documents have to be published to be able to use
  // this method.
  stages() {
    const stages = Stage.where(
      { shipmentId: this.getId() },
      { sort: { sequence: 1 } }
    );

    // eslint-disable-next-line consistent-return
    return (stages || []).map(stage => ({
      ...stage,
      number: `${this.number}-${stage.sequence}`
    }));
  }

  async getStages(options = {}) {
    const stages = await Stage.where(
      { shipmentId: this.getId() },
      { sort: { sequence: 1 }, ...options }
    );

    // eslint-disable-next-line consistent-return
    return (stages || []).map(stage => ({
      ...stage,
      number: `${this.number}-${stage.sequence}`
    }));
  }

  trackUrl() {
    const account = AllAccounts.first(this.accountId, { fields: { slug: 1 } });
    let domain;
    if (account && account.slug && Meteor.isProduction) {
      domain = `https://${account.slug}.${Meteor.settings.public.URL}`;
    }
    return Meteor.absoluteUrl(
      `track/${this.id}`,
      domain
        ? {
            rootUrl: domain
          }
        : undefined
    );
  }

  getTrackUrl() {
    return Meteor.absoluteUrl(`track/${this.id}`);
  }

  updateFlags(which) {
    let updates;
    if (typeof which === "string") {
      updates = [which];
    } else {
      updates = which;
    }
    updates.forEach(update => {
      if (typeof updateFlags[update] === "function") {
        updateFlags[update].call(this);
      }
    });
  }

  // // legacy
  // _item() {
  //   const itemIds = this.itemIds || [];
  //   const [firstItemId] = itemIds;
  //   return firstItemId ? Item.first({ _id: firstItemId }) : null;
  // }

  // // legacy
  // _items() {
  //   return Item.where({ shipmentId:getId() });
  // }

  getNestedItems() {
    return ShipmentItem.where({ shipmentId: this.getId() });
  }

  async hasNestedItems() {
    const count = await ShipmentItem.count({ shipmentId: this.getId() });
    return count > 0;
  }

  isTendered() {
    return Boolean(this.priceRequestId);
  }

  getTotalCost() {
    const costs = this.costs || [];

    return costs.reduce((accumulator, cost = {}) => {
      const amount = (cost && cost.amount) || {};
      const value = (amount.value || 0) * (amount.rate || 1);

      return accumulator + value;
    }, 0);
  }

  getManualCost() {
    const costs = this.costs || [];

    return costs.reduce((accumulator, cost = {}) => {
      const { amount = {}, source } = cost || {};
      const value = (amount.value || 0) * (amount.rate || 1);

      const isManualCost = source === "input";
      const conditionalValue = isManualCost ? value : 0;

      return accumulator + conditionalValue;
    }, 0);
  }

  async getExchangeDate() {
    // if no date in cost item then:
    // 1. either on shipment.costParams.currencyExchangeDate
    // 2. either on actual sail date (from stage)
    // 3. either on planned sail date (from stage)
    // 4. either on planned pickup date (from shipment)
    // 5. either on shipment creation date (from shipment)
    const exchangeDate = get(this, "costParams.currencyDate");

    debug("getExchangeDate for exchangeDate %o", exchangeDate);

    let date;
    if (exchangeDate && exchangeDate < new Date()) {
      date = exchangeDate;
    } else {
      const stages = await this.getStages();
      const { actual, planned } = get(stages, "[0].dates.pickup.arrival", {});
      debug("continue with stage dates !", { actual, planned });
      date = actual || planned || this.pickup.date || this.created.at;
    }
    debug("exchange date result %o", date);

    date = moment.min(moment(date || new Date()), moment().subtract(1, "day"));
    debug("exchange date use %o", date);

    return moment(date)
      .startOf("day")
      .toDate();
  }

  // eslint-disable-next-line consistent-return
  cleanAddressFormat(direction) {
    // [ pickup, delivery ]
    // locode: Antwerp, Belgium (BEANR)
    // shortCode: name, BE 9000
    let s;
    const location = oPath([direction, "location"], this);
    if (location) {
      s = "";
      if (location.name != null) {
        s += `${location.name}, `;
      }
      if (location.zip != null) {
        s += `${location.countryCode} ${location.zip}`;
      } else if (location.locode) {
        const country = Address.countryName(location.countryCode);
        s += `${country} `;
        s += `<span style='opacity:0.3'>(${location.countryCode} ${location.locode.code})<span>`;
      }
      return s;
    }
  }
}

Shipment._collection = new Mongo.Collection("shipments");

Shipment._collection.attachSchema(ShipmentSchema);
Shipment._collection = Shipment.updateByAt(Shipment._collection);

// keep track of changes!
Shipment._collection = Shipment.storeChanges(Shipment._collection);
export { Shipment };
