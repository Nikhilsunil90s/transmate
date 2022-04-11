import get from "lodash.get";
import { getSimilarShipments } from "@transmate-eu/bigquery_module_transmate";
import { JobManager } from "../../../utils/server/job-manager.js";

import { AllAccountsSettings } from "../../allAccountsSettings/AllAccountsSettings";
import { Shipment } from "../../shipments/Shipment";
import { PriceRequest } from "../PriceRequest";
import { PriceListTemplate } from "../../priceListTemplates/PriceListTemplate";
import { Location } from "../../locations/Location";
import { arraydiff } from "/imports/utils/functions/fnArrayHelpers";
import { oPath } from "/imports/utils/functions/path";
import { callCloudFunction } from "/imports/utils/server/ibmFunctions/callFunction";

import { accountGetProfileService } from "/imports/api/allAccounts/services/accountGetProfile";
import { controlShipmentAccess } from "/imports/api/shipments/services/shipmentAccess";
import { EdiJobs } from "/imports/api/jobs/Jobs";
import businessDays from "../../_jsonSchemas/simple-schemas/_utilities/businessDays";
import newJob from "../../jobs/newJob";

const debug = require("debug")("price-request:service");

export const priceRequestService = ({ userId, accountId }) => ({
  userId,
  accountId,
  orgShipmentIds: [],
  errors: [],
  warnings: [],
  success: {},
  async init({ priceRequest, priceRequestId }) {
    this.priceRequest =
      priceRequest || (await PriceRequest.first({ _id: priceRequestId }));
    if (!this.priceRequest) {
      throw new Error("not-found", "could not find document in db");
    }

    this.priceRequestId = priceRequestId || priceRequest._id;

    // we store shipmentIds as we need to be able to unflag later if one is deleted
    this.orgShipmentIds = this.getShipmentIds();
    return this;
  },
  async create(data) {
    await this.getAccountPreferences();

    const dataReq = {
      // defaults:
      creatorId: this.accountId,
      customerId: this.accountId,
      requestedBy: this.userId,
      type: "spot",
      status: "draft",
      version: 0,
      currency: "EUR",
      dueDate: businessDays(),
      created: { by: this.userId, at: new Date() },

      // overrides:
      settings: {
        templateId: this.templateId || "TEMPL:SPOT-SHIPM-SINGLE",
        templateSettings: this.templateSettings
      },
      ...data
    };
    this.priceRequest = await PriceRequest.create_async(dataReq);
    this.priceRequestId = this.priceRequest._id;

    JobManager.post("price-request.created", {
      userId: this.userId,
      accountId: this.accountId,
      priceRequestId: this.priceRequestId
    });
    return this;
  },
  async refreshObj() {
    // update obj after run, to get updates in class!
    this.priceRequest = await PriceRequest.first({ _id: this.priceRequestId });
    if (!this.priceRequest) {
      throw new Error(
        "not-found",
        `could not find document in db:${this.priceRequestId}`
      );
    }
    return this;
  },

  /** gets account preferences such as default template & settings   */
  async getAccountPreferences() {
    if (!this.accountId) {
      throw Error("accountId must be set!");
    }
    const settings = await AllAccountsSettings.first(this.accountId, {
      fields: { priceList: 1 }
    });

    this.templateId =
      oPath(["priceList", "defaultTemplates", "spot"], settings) ||
      "TEMPL:SPOT-SHIPM-SINGLE";

    const template = (await PriceListTemplate.first(this.templateId)) || {};
    this.templateSettings = template.settings || {};
    return this;
  },

  /**
   * allows to add/remove a bidder & perform some checks
   * add a bidder: if status is already in requested -> trigger mail hook
   * remove a bidder: if status is already in requested -> notification??
   * @param {String} action [add, remove]
   * @param {[String]} partnerIds partnerIds after the update -> sort out what to remove/ add
   * @param {String=} name partner name to add
   */
  async addRemoveBidders({ partnerIds: newPartnerIds }) {
    if (!this.accountId) {
      throw Error("accountId must be set!");
    }
    debug("addRemoveBidders", { newPartnerIds });
    const currentBidderIds = (this.priceRequest.bidders || []).map(
      ({ accountId: id }) => id
    );
    debug({ currentBidderIds });

    // make unique to avoid issues (adding 2x same carrier)
    const newPartnersUniqueIds = [...new Set(newPartnerIds || [])];
    const { status } = this.priceRequest;

    const bidderIdsToAdd = newPartnersUniqueIds.filter(
      id => !currentBidderIds.includes(id)
    );
    const biddersToRemove = (this.priceRequest.bidders || []).filter(
      ({ accountId: id }) => !newPartnersUniqueIds.includes(id)
    );

    // actions for adding partners:
    debug({ bidderIdsToAdd });
    try {
      await Promise.all(
        bidderIdsToAdd.map(async partnerId => {
          const srv = accountGetProfileService({
            accountId: partnerId,
            myAccountId: this.accountId
          });
          await srv.getAccountDoc_async();
          const { name, contacts } = srv.getNameAndContacts();

          await this.priceRequest.push({
            bidders: { accountId: partnerId, name, contacts }
          });
        })
      );

      if (["requested"].includes(status))
        JobManager.post("price-request.requested", this.priceRequest);
    } catch (e) {
      console.error({ e });
      this.errors.push("issue while adding bidders");
    }

    let removeCount = 0;
    debug({ biddersToRemove });

    // actions to remove partner:
    await Promise.all(
      biddersToRemove.map(async ({ accountId: partnerId, bid }) => {
        if (["requested"].includes(status) && bid) {
          this.warnings.push({
            partnerId,
            warnings: "Partner has already placed a bid"
          });
        }
        if (["requested"].includes(status)) {
          // retrigger notification hook
          debug(
            "send notification for price request %s ,  %o",
            this.priceRequest._id,
            { partnerId }
          );
          JobManager.post("price-request.cancelled", {
            priceRequest: this.priceRequest,
            partnerId
          });
        }
        debug("pull partner %s", partnerId);
        await this.priceRequest.pull({ bidders: { accountId: partnerId } });
        removeCount += 1;
      })
    );

    // if the status is requested, we need to update access, otherwise, no need to set access as there should be none
    if (this.priceRequest.status === "requested")
      this.allowShipmentAccess(true);
    this.success.accountsAdded = bidderIdsToAdd.length;
    this.success.accountsRemoved = removeCount;
    return this;
  },

  async verifyItems({ items = [] }) {
    const itemShipmentIds = items.map(({ shipmentId }) => shipmentId);

    // check which shipments can be added:
    this.newItemIds = [];
    const shipItems = await Shipment.aggregate([
      {
        $match: { _id: { $in: itemShipmentIds } }
      },
      { $project: { _id: 1, priceRequestId: 1, status: 1, number: 1 } },
      {
        $lookup: {
          from: "shipment.items",
          let: { shipmentId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$shipmentId", "$$shipmentId"] } } }
          ],
          as: "items"
        }
      },
      { $addFields: { itemCount: { $size: "$items" } } }
    ]);

    itemShipmentIds.forEach(id => {
      const doc = shipItems.find(({ _id }) => _id === id);

      if (!doc) {
        this.errors.push({
          shipmentId: id,
          issue: "notFound"
        });
      } else if (doc.priceRequestId) {
        this.errors.push({
          shipmentId: id,
          number: doc.number,
          issue: "hasPriceRequest"
        });
      } else if (doc.itemCount === 0) {
        this.errors.push({
          shipmentId: id,
          number: doc.number,
          issue: "noItems"
        });
      } else if (!["draft"].includes(doc.status)) {
        this.errors.push({
          shipmentId: id,
          number: doc.number,
          issue: "wrongStatus"
        });
      } else {
        this.newItemIds.push(id);
      }
    });
    this.validItems = this.newItemIds;
    return this;
  },
  async addItems() {
    const newItems = this.newItemIds.map(shipmentId => ({ shipmentId }));
    if (newItems.length > 0) {
      await this.priceRequest.push({ items: { $each: newItems } });
      await this.setShipmentLinks();

      // remote function to construct the params:
      this.remoteRecalculateItemParams();
    }

    return this;
  },

  // DO NOT USE:
  update(data) {
    debug("update price request with %o", data);
    this.priceRequest.update(data);

    if (data.items) {
      // if items change this should be run always
      this.setShipmentLinks();
    }
    if ((data || {}).status === "deleted") {
      // in this case we also need to remove the shipment links
      debug("remove shipment links!");
      this.removeLinksFromShipments();
    }
    return this;
  },
  async update_async(data) {
    debug("update price request with %o", data);
    await this.priceRequest.update_async(data);

    if (data.items) {
      // if items change this should be run always
      await this.setShipmentLinks();
    }
    if ((data || {}).status === "deleted") {
      // in this case we also need to remove the shipment links
      debug("remove shipment links!");
      await this.removeLinksFromShipments();
    }
    return this;
  },

  postponeDeadline({ dueDate }) {
    this.priceRequest.update({ dueDate });
    JobManager.post("price-request.postponed", {
      accountId: this.accountId,
      priceRequestId: this.priceRequestId,
      dueDate
    });
    return this;
  },

  cleanItemsFromTo({ items = [] }) {
    // get unlocode data
    return items.map(item => {
      ["from", "to"].forEach(dir => {
        const locationId = oPath(["params", dir, "locationId"], item);
        const location = locationId && Location.first(locationId);
        if (location) {
          item.params[dir].location = {
            fnList: location.fnList,
            name: location.name,
            locationCode: location.locationcode
          };
        }
      });
      return items;
    });
  },
  removeLinksFromShipments() {
    // const shipmentIds = this.getShipmentIds();
    // don't rely on pr shipment ids. this is safer
    const priceRequestId = this.priceRequest._id;
    const updateResult = Shipment._collection.update(
      { priceRequestId },
      { $unset: { priceRequestId: "" } },
      { multi: true }
    );
    debug("removeLinksFromShipments %o", updateResult);
    return this;
  },
  async setShipmentLinks() {
    const shipmentIds = this.getShipmentIds();
    const priceRequestId = this.priceRequest._id;

    // this way there is no moment without access
    // but it might be better to delete all and reset?
    await Shipment._collection.update(
      { _id: { $in: shipmentIds } },
      { $set: { priceRequestId } },
      { multi: true }
    );

    // remove from deleted items:
    const removedShipmentIds = arraydiff({
      masterArr: shipmentIds,
      subsetArr: this.orgShipmentIds
    });
    await Shipment._collection.update(
      { _id: { $in: removedShipmentIds }, priceRequestId },
      { $unset: { priceRequestId: "" } },
      { multi: true }
    );

    // store current shipment ids in orgShipmentIds
    this.orgShipmentIds = shipmentIds;
    return this;
  },
  getShipmentIds() {
    // returns shipmentIds in itemlist
    return (this.priceRequest.items || []).map(item => (item || {}).shipmentId);
  },

  // function that can be called direct
  regenerateAllItemsDirect(priceRequestId) {
    this.priceRequestId = priceRequestId;

    // resets validated flag:
    PriceRequest._collection.update(
      { _id: priceRequestId },
      { $set: { "items.$[].validated": false } },
      { bypassCollection2: true }
    );

    this.remoteRecalculateItemParams();
  },

  /** trigger cloud function to recalculate  */
  async remoteRecalculateItemParams() {
    const response = await callCloudFunction(
      "runPriceRequestBuildItems",
      {
        priceRequestId: this.priceRequestId
      },
      { userId: this.userId, accountId: this.accountId }
    );
    const result = get(response, "result");
    if (result) {
      debug("remoteRecalculateItemParams %o", response.result);
      this.refreshObj();
    } else {
      console.error(
        "we expected items key in remoteRecalculateItemParams ",
        response
      );
    }
    return this;
  },
  async remotePriceRequestSummary() {
    const response = await callCloudFunction(
      "runPriceRequestSummary",
      {
        priceRequestId: this.priceRequestId
      },
      { userId: this.userId, accountId: this.accountId }
    );
    if (get(response, "result.calculation")) {
      debug("runPriceRequestSummary %o", get(response, "result.calculation"));

      // function does update the document, but this will update the class and set update flag
      this.priceRequest.calculation = get(response, "result.calculation");
    } else {
      console.error("we expected calculation key in ", response);
    }

    return this;
  },
  getShipmentWeight(shipmentId) {
    const item = (this.priceRequest.items || []).find(
      el => el.shipmentId === shipmentId
    );
    return get(item, "params.goods.quantity.kg");
  },

  async addAnalyseDataSimulations() {
    // get the simulation data for all shipmentids

    const shipments = await Shipment.where(
      {
        _id: { $in: this.getShipmentIds() },
        "simulation.result": { $exists: true }
      },
      { fields: { "simulation.result": 1, type: 1 } }
    );
    this.simulationData = [];
    this.route = {};
    if (!Array.isArray(shipments) || shipments.length === 0) {
      debug("no shipments found with simulation");

      return this;
    }

    debug(
      "we checked %o this shipments and %o returned with simulations",
      this.getShipmentIds(),
      shipments.length
    );
    shipments.forEach(shipment => {
      debug("get info from  shipment %o", shipment);
      this.route[shipment._id] = {
        shipmentType: shipment.type,
        km: get(
          shipment,
          `simulation.result.${shipment.type}.results.0.totalKm`
        )
      };
      debug("extra info (mode and km) per shipment", this.route);

      // get total volume
      // to do : return kg in simulation obj so it works for equipments (with default / recalulated weights)
      const kg = this.getShipmentWeight(shipment._id) || undefined;
      Object.keys(get(shipment, "simulation.result") || []).forEach(
        shipmentType => {
          this.simulationData.push({
            type: "simulation",
            shipmentId: shipment._id,
            shipmentType,
            kg,
            km: get(
              shipment.simulation.result[shipmentType],
              "results.0.totalKm"
            ),
            totalCostEur: get(
              shipment.simulation.result[shipmentType],
              "results.0.totalCost"
            )
          });
        }
      );
    });

    // filter with totalCostEur and add calculated
    this.simulationData = this.simulationData.filter(el => el.totalCostEur > 0);

    return this;
  },
  addAnalyseDataBids() {
    const calcItems = get(this.priceRequest, "calculation.items");
    debug("calculation items %o", calcItems);

    //    calcItems array, whit shipmentid.priceLists=[]

    this.bidData = [];
    if (Array.isArray(calcItems)) {
      calcItems.forEach(item => {
        (item.priceLists || []).forEach(price => {
          // add rates to array for each calc with a cost
          const { totalCost, carrierName } = price || {};
          if (totalCost > 0) {
            // to do : it would be much better to get the mode from the bidder! certainly if multiple modes are possible
            const { shipmentId } = item || {};
            const kg = this.getShipmentWeight(shipmentId) || undefined;

            const { km = undefined, shipmentType } =
              this.route[shipmentId] || {};
            this.bidData.push({
              shipmentId: item.shipmentId,
              totalCostEur: totalCost,
              type: "bid",
              carrierName,
              kg,
              km,
              shipmentType
            });
          }
        });
      });
    }
    debug("bidData %o", this.bidData);
    return this;
  },
  allowShipmentAccess(set, shipmentIds) {
    // is set is true, we will build an array with accountIds that should have access, otherwise empty array
    const accountIds = set
      ? (this.priceRequest.bidders || []).map(bidder => bidder.accountId)
      : [];
    debug("set shipment access for pr : %o", {
      shipmentIds: this.getShipmentIds(),
      accountIds,
      set
    });

    controlShipmentAccess({
      shipmentIds: shipmentIds || this.getShipmentIds(),
      action: "priceRequest",
      id: this.priceRequest._id,
      accountIds
    });

    return this;
  },
  async addAnalyseDataBQ() {
    // get data for all shipmentids
    const shipmentIds = this.getShipmentIds();
    const shipments = await Shipment.where(
      {
        _id: { $in: shipmentIds },
        "pickup.location.latLng.lat": { $exists: true },
        "delivery.location.latLng.lat": { $exists: true }
      },
      { fields: { "pickup.location.latLng": 1, "delivery.location.latLng": 1 } }
    );
    this.historicData = [];
    if (!Array.isArray(shipments) || shipments.length === 0) {
      debug("no shipments found with location info");
      return this;
    }
    debug(
      "we checked %o this shipments and %o returned with locations",
      shipmentIds,
      shipments.length
    );
    this.historicData = [];

    // only run if we have a remote db
    if (
      !process.env.MONGO_URL.includes("localhost") &&
      !process.env.MONGO_URL.includes("127.0.0.1")
    ) {
      await Promise.all(
        shipments.map(async shipment => {
          const { pickup, delivery } = shipment;
          const bQHistoric =
            (await getSimilarShipments({
              accountId: this.priceRequest.creatorId,
              fromLng: get(pickup, "location.latLng.lng"),
              fromLat: get(pickup, "location.latLng.lat"),
              toLng: get(delivery, "location.latLng.lng"),
              toLat: get(delivery, "location.latLng.lat"),
              margin: 0.2
            })) || [];
          debug(
            "returned data bq historic for %s: %o",
            shipment._id,
            bQHistoric
          );

          // get lat long with lat long get matching shipments
          this.historicData = this.historicData.concat(bQHistoric);
          return true;
        })
      );
    } else {
      console.warn("we need a remote db for BQ calls to work");
    }
    if (!Array.isArray(this.historicData) || this.historicData.length === 0) {
      debug("no  historicData found with location info");
      return this;
    }
    const uniqueIds = [...new Set(this.historicData.map(el => el.shipmentId))];
    debug(
      "reduce historic data %o to %o",
      this.historicData.length,
      uniqueIds.length
    );

    // only show those with a cost
    this.historicData = uniqueIds
      .filter(el => !shipmentIds.includes(el)) // remove ids from tendered shipments
      .map(id => this.historicData.find(el => el.shipmentId === id))
      .filter(el => el.totalCostEur > 0)

      .map(el => {
        return {
          ...el,
          type: `historic ${el.pickupDate || ""}`
        };
      });
    return this;
  },
  queueAnalyse(waitSeconds = 1) {
    debug("setup job for getAnalyse (can take 30sec)");

    // set analyse (shows history and simulations)
    // this will call in a worker "getAnalyse()"
    newJob(EdiJobs, "process.priceRequest.recalculate", {
      priceRequestId: this.priceRequest._id
    })
      .delay(waitSeconds * 1000)
      .timeout(60 * 1000)
      .save();
    return this;
  },
  async getAnalyse() {
    await this.remotePriceRequestSummary();
    debug("calculation key %o", this.priceRequest.calculation);

    // combine simulation, bq and bids
    await this.addAnalyseDataBQ();
    await this.addAnalyseDataSimulations();
    this.addAnalyseDataBids();
    this.priceRequest.analyseData = [
      ...this.historicData,
      ...this.simulationData,
      ...this.bidData
    ];

    // sort to re-group per shipment id
    // this.priceRequest.analyseData.sort((a, b) =>
    //   b.shipmentId.localeCompare(a.shipmentId)
    // );
    await this.update_async({ analyseData: this.priceRequest.analyseData });
    return this.priceRequest;
  },

  get() {
    return this.priceRequest;
  }
});
