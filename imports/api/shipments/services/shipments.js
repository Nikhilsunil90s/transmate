import { Random } from "/imports/utils/functions/random.js";
import { JobManager } from "../../../utils/server/job-manager.js";
import { oPath } from "/imports/utils/functions/path";

// collections
import { Shipment } from "/imports/api/shipments/Shipment";
import { ShipmentProject } from "/imports/api/shipmentProject/ShipmentProject";

import { Stage } from "/imports/api/stages/Stage";
import { setShipmentNotificationFlags } from "../../notifications/helpers/setShipmentNotificationFlags";
import { CheckShipmentSecurity } from "/imports/utils/security/checkUserPermissionForShipment";

const debug = require("debug")("shipments:methods");

function updateShipmentProject({ projectId, update }) {
  return ShipmentProject._collection.update({ _id: projectId }, update);
}
class ShipmentService {
  constructor({ shipment, accountId, userId }) {
    this.accountId = accountId;
    this.userId = userId;
    this.context = {
      userId: this.userId,
      accountId: this.accountId
    };
    this.shipment = shipment;
    this.shipmentId = shipment && shipment._id;
  }

  async init({ shipmentId }) {
    this.shipmentId = shipmentId;
    this.shipment = await Shipment.first(shipmentId, {
      fields: {
        _id: 1,
        status: 1,
        accountId: 1,
        shipperId: 1,
        carrierIds: 1,
        shipmentProjectInboundId: 1,
        shipmentProjectOutboundId: 1,
        number: 1 // required for notifications
      }
    });
    debug("shipmint init %o ", this.shipment);
    if (!this.shipment) throw new Error("Shipment not found");
    return this;
  }

  async checkPermission(action) {
    const check = new CheckShipmentSecurity(
      {
        shipment: this.shipment
      },
      { accountId: this.accountId, userId: this.userId }
    );
    await check.getUserRoles();
    check.can({ action }).throw();
    return this;
  }

  async selectCarrier({ priceListId, carrierId }) {
    this.selectedCarrierId = carrierId;

    // if !priceListId and !carrierId ==> reset the shipment
    if (priceListId) {
      await this.shipment.update_async({
        priceListId,
        carrierIds: [carrierId] // only select single one for now - when multiple >> change this
      });
    } else {
      await this.shipment.del("priceListId");
      if (!carrierId) {
        await this.shipment.update_async({ carrierIds: [] });
      } else {
        await this.shipment.update_async({ carrierIds: [carrierId] }); // only select single one for now - when multiple >> change this
      }
    }
    debug("get stages for shipment %o ", this.shipment);

    // Update carrierId in each stage
    const stages = await this.shipment.getStages();
    debug("stages %o ", stages);
    await Promise.all(
      stages.map(async stage => {
        if (carrierId) {
          await Stage._collection.update(
            { _id: stage._id },
            { $set: { carrierId } }
          );
        } else {
          await Stage._collection.update(
            { _id: stage._id },
            { $unset: { carrierId: 1 } }
          );
        }
      })
    );

    this.shipment.addUpdate("assigned", { carrierId }, this.context);
    setShipmentNotificationFlags({
      shipmentId: this.shipmentId
    }).setAfterCarrierAssignment(carrierId);
    return this;
  }

  /** will update the costs in a shipment based on the price lookup result
   * @param {{priceListResult: Object}} param0
   */
  async updateCosts({ priceListResult }) {
    let price;

    // Remove existing costs with price list source (consider them outdated)
    let costs = (this.shipment.costs || []).filter(
      cost => cost.source !== "priceList"
    );

    debug(
      "current shipment cost of id %s costs : %o",
      this.shipment._id,
      costs
    );

    // stop if no priceListId is set...
    if (this.shipment.priceListId) {
      // Remove manually input base rate
      costs = costs.filter(cost => cost.type !== "base");

      if (priceListResult) {
        // results already given, no call needed!
        debug("update shipment cost based on cost details given, no call!");
        price = priceListResult;
      }

      if (price && price.costs) {
        price.costs.forEach(cost => {
          return costs.push({
            id: Random.id(6).toUpperCase(), // unique identifier
            costId: cost.rate.costId,
            description: cost.rate.name,
            comments: cost.rate.comment,
            tooltip: cost.rate.tooltip,
            amount: {
              value: cost.total.listValue,
              currency: cost.total.listCurrency
            },

            // exchangeDate: cost.total.exchangeDate #keep this for one on one matches
            source: "priceList",
            priceListId: price._id,
            added: {
              by: this.userId,
              at: new Date()
            },
            accountId: this.accountId, // account that added it.
            sellerId: cost.carrierId || this.selectedCarrierId
          });
        });
      }
    }

    const exchangeDate = oPath(["calculationParams", "exchangeDate"], price);
    await this.shipment.update_async({
      costs,
      ...(exchangeDate
        ? {
            "costParams.exchangeDate": exchangeDate
          }
        : undefined)
    });

    if (costs.length > 0) {
      await this.shipment.push({ flags: "has-costs" }, true);
    } else {
      await this.shipment.pull({ flags: "has-costs" });
    }

    return this;
  }

  // canceling will remove it from linked project if it is attached...
  async cancel() {
    const shipmentId = this.shipment._id || "missing";
    debug("set all stages to canceled for shipment id", shipmentId);
    const promises = [
      Stage._collection.update(
        { shipmentId },
        { $set: { status: "canceled" } },
        { multi: true }
      ),

      this.shipment.update_async({ status: "canceled" }),
      this.shipment.addUpdate("canceled", {}, this.context)
    ];

    if (this.shipment.shipmentProjectInboundId)
      promises.push(
        updateShipmentProject({
          projectId: this.shipment.shipmentProjectInboundId,
          update: { $pull: { inShipmentIds: shipmentId } }
        })
      );
    if (this.shipment.shipmentProjectOutboundId)
      promises.push(
        updateShipmentProject({
          projectId: this.shipment.shipmentProjectOutboundId,
          update: { $pull: { outShipmentIds: shipmentId } }
        })
      );

    await Promise.all(promises);
    JobManager.post("shipment.canceled", this.shipmentId);

    return this;
  }

  // unCancelShipment == backToDraft
  // a shipment that had been canceled/ archived that is put back to draft
  async unCancel() {
    const shipmentId = this.shipment._id || "missing";
    debug("set all stages to draft for shipment id", shipmentId);
    const promises = [
      Stage._collection.update(
        { shipmentId },
        { $set: { status: "draft" } },
        { multi: true }
      ),

      this.shipment.update_async({ status: "draft" }),
      this.shipment.addUpdate("draft", {}, this.context)
    ];

    if (this.shipment.shipmentProjectInboundId)
      promises.push(
        updateShipmentProject({
          projectId: this.shipment.shipmentProjectInboundId,
          update: { $addToSet: { inShipmentIds: shipmentId } }
        })
      );
    if (this.shipment.shipmentProjectOutboundId)
      promises.push(
        updateShipmentProject({
          projectId: this.shipment.shipmentProjectOutboundId,
          update: { $addToSet: { outShipmentIds: shipmentId } }
        })
      );

    await Promise.all(promises);
    JobManager.post("shipment.draft", this.shipment);
  }

  async archive() {
    JobManager.post("shipment.archived", this.shipment);
    await this.shipment.update_async({ isArchived: true });
    this.shipment.addUpdate("archived", {}, this.context);
    return this;
  }

  async delete() {
    const shipmentId = this.shipment._id || "missing";
    JobManager.post("shipment.deleted", this.shipment);
    const promises = [
      this.shipment.update_async({ deleted: true }),
      this.shipment.addUpdate("deleted", {}, this.context)
    ];

    if (this.shipment.shipmentProjectInboundId)
      promises.push(
        updateShipmentProject({
          projectId: this.shipment.shipmentProjectInboundId,
          update: { $pull: { inShipmentIds: shipmentId } }
        })
      );
    if (this.shipment.shipmentProjectOutboundId)
      promises.push(
        updateShipmentProject({
          projectId: this.shipment.shipmentProjectOutboundId,
          update: { $pull: { outShipmentIds: shipmentId } }
        })
      );
    await Promise.all(promises);
    return this;
  }

  get() {
    return this.shipment;
  }
}

export { ShipmentService };
