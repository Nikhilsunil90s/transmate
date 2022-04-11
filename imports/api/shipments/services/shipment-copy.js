import moment from "moment";
import pick from "lodash.pick";
import unset from "lodash.unset";

import { Shipment } from "../Shipment";
import { ShipmentItem } from "../../items/ShipmentItem";
import { Stage } from "../../stages/Stage";
import { ShipmentProject } from "../../shipmentProject/ShipmentProject";

import { ShipmentItemSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/shipment-item";

const debug = require("debug")("shipment:copy");

const shipmentFields = [
  "pickup",
  "delivery",
  "type",
  "serviceLevel",
  "incoterm",
  "plannerIds",
  "accountId",
  "shipperId",
  "consigneeId",
  "providerIds",
  "notes",
  "drivingDistance",
  "drivingDuration",
  "sphericalDistance",
  "costParams"
];

const shipmentProjectFields = [
  "shipmentProjectInboundId",
  "shipmentProjectOutboundId"
];

// eslint-disable-next-line no-underscore-dangle
const nestedItemFields = ShipmentItemSchema.omit(
  "shipmentId",
  "parentItemId",
  "references"
)._firstLevelSchemaKeys;

const stageFields = [
  "mode",
  "sequence",
  "from",
  "to",
  "drivingDistance",
  "drivingDuration",
  "sphericalDistance",
  "dates"
];

const STOPS = ["pickup", "delivery"];
const EVENTS = ["arrival", "departure"];
const DATE_TYPES_TO_REMOVE = ["scheduled", "actual"];

const DEFAULT_DATE_OFFSET = 365;

/**
 * @param {Object} options options object
 * @param {Number} options.dateOffset # days you want to offset the dates
 * @param {Boolean} options.keepDates # keep all dates except the actuals
 * @param {Boolean} options.omitProjectFields
 * 1 retrieve shipment
 * 2 retrieve subdocs
 * 3 copy selected attributes
 * 4 store
 * 5 return shipmentId
 */
export const shipmentCopy = ({ accountId, userId }) => ({
  userId,
  accountId,
  async init({ shipmentId, options = {} }) {
    this.shipmentId = shipmentId;
    this.options = options;
    this.dateOffset = options.dateOffset || DEFAULT_DATE_OFFSET;
    this.shipment = await Shipment.first(this.shipmentId);
    if (!this.shipment)
      throw new Error(`${this.shipmentId} shipment not found`);

    this.stages = await Stage.where({ shipmentId: this.shipmentId });
    debug("stages %o", this.stages);
    if (!this.stages || this.stages.length < 1)
      throw new Error(
        `You can't copy shipments without stages shipment: ${this.shipmentId}`
      );

    this.itemsNested = await this.shipment.getNestedItems();
    return this;
  },

  async copyShipment() {
    // create without stages and items:
    const shipmentDoc = {
      ...pick(this.shipment, shipmentFields),
      ...(!this.options.omitProjectFields
        ? pick(this.shipment, shipmentProjectFields)
        : {}),
      accountId: this.accountId
    };

    // removes scheduled and actual dates and offsets (if indicated) the planned and requested dates
    STOPS.forEach(stop => {
      ["date", "datePlanned"].forEach(ts => {
        if (!this.options.keepDates) {
          shipmentDoc[stop][ts] = moment(this.shipment[stop].date)
            .add(this.dateOffset, "days")
            .toDate();
        }
      });
      ["dateScheduled", "dateActual"].forEach(ts => {
        delete shipmentDoc[stop][ts];
      });
    });

    shipmentDoc.created = { by: this.userId, at: new Date() };
    shipmentDoc.updated = shipmentDoc.created;

    this.newShipment = await Shipment.create_async({ ...shipmentDoc });
    return this;
  },

  async copyItems() {
    // itemsIds are not stored in shipment!
    // we need to iterate over the items to preserve the structure

    if (this.itemsNested.length > 0) {
      const maxDepth = this.itemsNested.reduce((a, { level: b }) => {
        return Math.max(a, b);
      }, 0);

      // use mapping object to preserve link with parentItemId
      const idMap = {};

      const buildForLevel = async lvl => {
        await Promise.all(
          this.itemsNested
            .filter(({ level }) => level === lvl)
            .map(async item => {
              const itemDoc = pick(item, nestedItemFields);
              itemDoc.shipmentId = this.newShipment._id;
              if (item.parentItemId) {
                itemDoc.parentItemId = idMap[item.parentItemId];
              }

              const itemN = await ShipmentItem.create_async(itemDoc);
              idMap[item._id] = itemN._id;
            })
        );
      };

      let i;
      for (i = 0; i <= maxDepth; i += 1) {
        // need to await as it is building the hierarchy!!
        // eslint-disable-next-line no-await-in-loop
        await buildForLevel(i);
      }
    }
    return this;
  },

  async copyStages() {
    this.stageIds = [];
    this.stageIds = await Promise.all(
      this.stages.map(async stage => {
        const stageDoc = pick(stage, stageFields);
        stageDoc.shipmentId = this.newShipment._id;

        if (!this.options.keepDates) {
          // will overwrite the copied dates[stop].arrival.planned
          stageDoc.dates = {};
          STOPS.forEach(stop => {
            const newDate = moment(stage.dates[stop].arrival.planned)
              .add(this.dateOffset, "days")
              .toDate();
            stageDoc.dates[stop] = { arrival: { planned: newDate } };
          });
        }

        // always remove actuals & scheduled:
        STOPS.forEach(stop => {
          EVENTS.forEach(event => {
            DATE_TYPES_TO_REMOVE.forEach(type => {
              unset(stageDoc, ["dates", stop, event, type]);
            });
          });
        });

        const stageN = await Stage.create_async(stageDoc);
        return stageN._id;
      })
    );
    return this;
  },

  async updateShipment(overrides = {}) {
    await this.newShipment.update_async({
      ...overrides,
      stageIds: this.stageIds
    });
    return this;
  },

  /** assure the inbound & outbound references in projects are kept in sync
   * we don't wait for the update
   */
  async updateReferencingDocs() {
    const {
      shipmentProjectOutboundId,
      shipmentProjectInboundId,
      id: newSipmentId
    } = this.newShipment || {};

    if (shipmentProjectInboundId) {
      await ShipmentProject._collection.update(
        { _id: shipmentProjectInboundId },
        { $addToSet: { inShipmentIds: newSipmentId } }
      );
    } else if (shipmentProjectOutboundId) {
      await ShipmentProject._collection.update(
        { _id: shipmentProjectOutboundId },
        { $addToSet: { outShipmentIds: newSipmentId } }
      );
    }
    return this;
  },

  getId() {
    return this.newShipment._id;
  }
});
