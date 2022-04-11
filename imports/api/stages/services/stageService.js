import dot from "dot-object";
import get from "lodash.get";
import { Meteor } from "meteor/meteor";
import { Address } from "../../addresses/Address";
import { parseAddress } from "../../shipments/services/parseAddress";

// data
import { Stage } from "../Stage";
import { CheckStageSecurity } from "../../../utils/security/checkUserPermissionsForStage";
import { invert } from "/imports/utils/functions/fnObjectInvert";
import {
  SCHEDULED_DATE_RECIPE,
  SCHEDULED_DATE_SHIPMENT_RECIPE,
  CONFIRMATION_RECIPE,
  CONFIRMATION_SHIPMENT_RECIPE
} from "/imports/api/stages/enums/fieldMaps";

import { triggerWorkerJob } from "/imports/api/workers/services/triggerWorkerJob.js";
import { setShipmentNotificationFlags } from "../../notifications/helpers/setShipmentNotificationFlags";

const debug = require("debug")("stage:service");

class StageSrv {
  constructor({ stage, shipment, accountId, userId }) {
    this.stage = stage;
    this.stageId = get(stage, "id");
    this.sequence = stage.sequence || 1;
    this.shipment = shipment;
    this.shipmentId = get(shipment, "_id");
    this.accountId = accountId;
    this.userId = userId;

    this.isFirstInSequence = this.sequence === 1;
    this.isLastInSequence = (this.shipment.stages?.length || 0) + 1 === 1;
    return this;
  }

  async getStageCount() {
    this.stageCount = await Stage.count({ shipmentId: this.shipmentId });
    return this;
  }

  async setStatus({ status }) {
    const check = new CheckStageSecurity(
      {
        stage: this.stage,
        shipment: this.shipment
      },
      {
        accountId: this.accountId,
        userId: this.userId
      }
    );
    await check.getUserRoles();
    switch (status) {
      case "release": {
        const { problems = [], pass } = await this.stage.isReadyForRelease();
        if (!pass) {
          throw new Error(
            `Not-ready, you cannot change the status to released, issues with: ${problems
              .filter(el => el)
              .concat(",")}`
          );
        }
        this.stage = await this.stage.update_async({ status: "planned" });

        // trigger notification & actions:
        await triggerWorkerJob({
          event: "shipment-stage.released",
          accountId: this.accountId,
          userId: this.userId,
          data: {
            shipmentId: this.shipment._id,
            stageId: this.stage._id,
            stageCount: this.stageCount,
            accountId: this.accountId,
            userId: this.userId
          }
        }).go();
        break;
      }
      case "draft": {
        check.can({ action: "putBackToDraft" });
        check.throw();

        this.stage = await this.stage.update_async({ status: "draft" });
        break;
      }
      case "planned": {
        check.can({ action: "putBackToPlanned" });
        check.throw();

        this.stage = await this.stage.update_async({ status: "planned" });
        break;
      }
      default:
        throw new Meteor.Error(
          `unkown stage status change`,
          `${status} is not a valid status`
        );
    }

    // Update shipment status
    await this.shipment.refreshStatus();
    return this;
  }

  /** update status of the stage after an update */
  async triggerStatusChange() {
    this.stage = await this.stage.reload();
    const stageStarted =
      this.stage.status === "planned" &&
      get(this.stage, "dates.pickup.arrival.actual");
    const stageCompleted =
      get(this.stage, ["status"]) === "started" &&
      !!get(this.stage, ["dates", "pickup", "arrival", "actual"]) &&
      !!get(this.stage, ["dates", "delivery", "arrival", "actual"]);

    if (stageCompleted) {
      await this.stage.update_async({ status: "completed" });
    } else if (stageStarted) {
      await this.stage.update_async({ status: "started" });
    }

    // Update shipment status
    await this.shipment.refreshStatus();
  }

  async verifyShipmentStatus({ status }) {
    // 0 if only 1 stage -> shipment status == stage status
    // 1 if stageCount > 1 -> status is partial / planned / draft

    let shipStatus;
    if (this.stageCount === 1) {
      shipStatus = this.stage.status;
    } else {
      const cc = await Stage.count({ shipmentId: this.shipment._id, status });
      if (cc !== this.stageCount) {
        shipStatus = "partial";
      } else {
        shipStatus = this.stage.status;
      }
    }
    await this.shipment.update_async({ status: shipStatus });
    return this;
  }

  /** splits stage based on new stop
   * @param {{id: String, type: String} } location
   */
  async splitStage({ location }) {
    const { accountId } = this;
    const { address, location: addrLoc } = await parseAddress({
      location,
      accountId
    });
    const addrUpdate = address || addrLoc;
    const currSequenceNo = this.sequence;

    // Create two new stages:
    // - one that starts on the previous start, and ends on the new stop
    // - and one that starts from the new stop and ends on previous destination
    const stageIds = await Promise.all(
      ["from", "to"].map(async (which, i) => {
        const newStage = {
          shipmentId: this.stage.shipmentId,
          sequence: currSequenceNo + i,
          carrierId: this.stage.carrierId, // copy over carrierId as well
          [which]: this.stage[which] // existing addrss
        };

        // Set location of the new stop
        const stop = which === "from" ? "to" : "from";
        newStage[stop] = addrUpdate;

        // set the dates of the new stop:
        // delivery dates -> to second stage which: ['to']
        // pikcup dates -> to first stage ['from']
        if (which === "from") {
          newStage.dates = { pickup: this.stage.dates.pickup };
          newStage.dates.delivery = this.stage.dates.pickup;
        } else {
          newStage.dates = { delivery: this.stage.dates.delivery };
          newStage.dates.pickup = this.stage.dates.pickup;
        }

        debug("new Stage: %s", JSON.stringify(newStage));
        const res = await Stage.create_async(newStage);
        return res._id;
      })
    );

    // Destroy original stage
    await this.stage.destroy_async();

    // increment all stages after curr stage
    await Stage._collection.update(
      {
        shipmentId: this.stage.shipmentId,
        sequence: { $gt: currSequenceNo + 1 }
      },
      { $inc: { sequence: 1 } },
      { multi: true }
    );

    // stageIds in shipment
    const omittedStageIds = (this.shipment.stageIds || []).filter(
      id => id !== this.stageId
    );
    await this.shipment.update_async({
      stageIds: [...new Set([...omittedStageIds, ...stageIds])] // make unique list
    });
    return stageIds[0];
  }

  async mergeStages({ nextStage }) {
    // 0. determine next stage
    // 1. both stages need to be in draft modus
    // 2. copy over the destination of the 2nd stage & overwrite this on the first stage
    // 3. delete the second stage
    if (!nextStage)
      throw new Meteor.Error("not-found", "No stage found to merge with");

    const { to } = nextStage;
    const dates = nextStage.dates.delivery;

    await this.stage.update_async({ to, "dates.delivery": dates });
    await nextStage.destroy();
    await Stage._collection.update(
      { shipmentId: this.shipment._id, sequence: { $gt: this.sequence } },
      { $inc: { sequence: -1 } },
      { multi: true }
    );
    return this;
  }

  async updateAddress({ stop, location, overrides = {} }) {
    // 0. get AddressData
    // 1. update stage
    // 2. find if it is the first or the last stage
    // 2. if from is mod & first stage -> update shipment from
    // 3. if to is mod & last stage -> update shipment to
    // 4. if there is a next stage -> update from so that to === from in next stage
    // if overrides exists
    debug("updating address attr %s, %s, %o", stop, this.stageCount);

    let addrUpdate;

    if (location) {
      // case: changing location by id
      const { address, location: addrLoc } = await parseAddress({
        location,
        accountId: this.accountId
      });

      addrUpdate = address || addrLoc;

      if (!addrUpdate)
        throw new Meteor.Error("error", "Location not found in db");
    } else {
      // case: overriding fields in the existing address
      const { name, countryCode, ...addressKeys } = overrides;
      addrUpdate = {
        ...this.stage[`${stop}`],
        ...(name ? { name } : {}),
        ...(countryCode ? { countryCode } : {}),
        address: {
          ...this.stage[`${stop}`].address,
          ...addressKeys
        }
      };

      if (this.stage[`${stop}`].addressId) {
        const orgAddress = await Address.first(
          { _id: this.stage[`${stop}`].addressId },
          Address.projectFields(this.accountId)
        );

        await Address._collection.update(
          {
            _id: this.stage[`${stop}`].addressId,
            accounts: { $elemMatch: { id: this.accountId } }
          },
          {
            $set: {
              "accounts.$.overrides": {
                ...orgAddress.accounts[0].overrides,
                ...Object.entries(overrides).reduce((acc, [k, v]) => {
                  if (k !== "name") {
                    acc[`${k}`] = v;
                  }
                  return acc;
                }, {})
              },
              ...(overrides.name ? { "accounts.$.name": overrides.name } : {})
            }
          },
          { bypassCollection2: true }
        );
      }
    }

    await this.stage.update_async({ [`${stop}`]: addrUpdate });

    // keep shipment in sync:
    if (this.isFirstInSequence && stop === "from") {
      await this.shipment.update_async({ "pickup.location": addrUpdate });
    } else if (this.sequence === this.stageCount && stop === "to") {
      await this.shipment.update_async({ "delivery.location": addrUpdate });
    }

    // keep next stage in sync:
    if (this.sequence < this.stageCount && stop === "to") {
      await Stage._collection.update(
        {
          shipmentId: this.shipment._id,
          sequence: this.sequence + 1
        },
        { $set: { from: addrUpdate } }
      );
    }

    return this;
  }

  async denormalizeStageDates({ loading, unloading, recipe }) {
    const dUpdateShipment = Object.entries({ loading, unloading }).reduce(
      (acc, [k, v]) => {
        if (k === "loading" && this.isFirstInSequence && v) {
          acc[k] = v;
        }
        if (k === "unloading" && this.isLastInSequence && v) {
          acc[k] = v;
        }
        return acc;
      },
      {}
    );

    if (Object.keys(dUpdateShipment).length) {
      await this.shipment.update_async(
        dot.dot(dot.transform(invert(recipe), dUpdateShipment))
      );
    }
    return this;
  }

  async scheduleStage({ loading, unloading }) {
    const invRecipe = invert(SCHEDULED_DATE_RECIPE);

    // ensure date (gql passes a number)
    const dUpdated = Object.entries({ loading, unloading }).reduce(
      (acc, [k, v]) => {
        acc[k] = !!v ? new Date(v) : v;
        return acc;
      },
      {}
    );
    const updates = dot.dot(dot.transform(invRecipe, dUpdated));
    if (Object.keys(updates).length === 0)
      throw new Error("No dates given in scheduling");

    await this.stage.update_async(updates);
    await this.denormalizeStageDates({
      ...dUpdated,
      recipe: SCHEDULED_DATE_SHIPMENT_RECIPE
    });

    return this.stage;
  }

  async confirmStage({ dates }) {
    const invRecipe = invert(CONFIRMATION_RECIPE);
    debug("confirm stage invRecipe %o", invRecipe);

    // ensure date (gql passes a number)
    const dUpdated = Object.entries(dates).reduce((acc, [k, v]) => {
      acc[k] = !!v ? new Date(v) : v;
      return acc;
    }, {});

    const updates = dot.dot(dot.transform(invRecipe, dUpdated));

    debug("confirm stage updates %o", updates);
    if (Object.keys(updates).length === 0) {
      // object must have keys
      throw new Error("no dates given in confirmStage");
    }
    await this.stage.update_async(updates);
    await this.triggerStatusChange();

    // deNormalization: >> dates from stage to shipment
    await this.denormalizeStageDates({
      loading: dUpdated.pickupArrival,
      unloading: dUpdated.deliveryArrival,
      recipe: CONFIRMATION_SHIPMENT_RECIPE
    });

    // job to check notifications [];
    setShipmentNotificationFlags({
      shipmentId: this.shipmentId
    }).updateAfterShipmentChange();

    return this.stage;
  }

  async assignDriver({ allocation }) {
    if (allocation != null) {
      const { driverId, plate, instructions } = allocation;
      await this.stage.update_async({ driverId, plate, instructions });
      const shipment = await this.stage.getShipment();
      await shipment.addUpdate("allocated", { driverId });
      return this.stage;
    }
    await this.stage.del("driverId");
    return this.stage.del("plate");
  }
}

export { StageSrv };
