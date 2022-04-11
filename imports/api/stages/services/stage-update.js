import dot from "dot-object";
import get from "lodash.get";
import pick from "lodash.pick";

// collections
import { Stage } from "/imports/api/stages/Stage";
import { Shipment } from "/imports/api/shipments/Shipment";
import { TYPES_MULTI } from "/imports/api/_jsonSchemas/enums/shipment";

import { setShipmentNotificationFlags } from "../../notifications/helpers/setShipmentNotificationFlags";

const debug = require("debug")("stages");

export const shipmentFields = {
  priceListId: 1,
  type: 1
};

//#region helpers
function shouldUpdateShipmentMode(updatesD) {
  return !!updatesD.mode;
}

function stageShouldHaveStartedStatus(updatesD) {
  return (
    !!updatesD["dates.pickup.arrival.actual"] ||
    !!updatesD["dates.delivery.arrival.actual"]
  );
}

function stageShouldHaveCompletedStatus(stageObj, updatesD) {
  return (
    (!!get(stageObj, ["dates", "pickup", "arrival", "actual"]) ||
      !!updatesD["dates.pickup.arrival.actual"]) &&
    (!!get(stageObj, ["dates", "delivery", "arrival", "actual"]) ||
      !!updatesD["dates.delivery.arrival.actual"])
  );
}

// first stage, planned
function isUpdatingPlannedPickupDate(stageObj, updatesD) {
  return updatesD["dates.pickup.arrival.planned"] && stageObj.sequence === 1;
}

// first stage, scheduled
function isUpdatingScheduledPickupDate(stageObj, updatesD) {
  return updatesD["dates.pickup.arrival.scheduled"] && stageObj.sequence === 1;
}

// first stage, actual
function isUpdatingActualPickupDate(stageObj, updatesD) {
  return updatesD["dates.pickup.arrival.actual"] && stageObj.sequence === 1;
}

// last stage, planned
function isUpdatingPlannedDeliveryDate(stageObj, updatesD, stgCount) {
  return (
    updatesD["dates.delivery.arrival.planned"] && stageObj.sequence === stgCount
  );
}

// last stage, scheduled
function isUpdatingScheduledDeliveryDate(stageObj, updatesD, stgCount) {
  return (
    updatesD["dates.delivery.arrival.scheduled"] &&
    stageObj.sequence === stgCount
  );
}

// last stage, actual
function isUpdatingActualDeliveryDate(stageObj, updatesD, stgCount) {
  return (
    updatesD["dates.delivery.arrival.actual"] && stageObj.sequence === stgCount
  );
}

//#endregion

export const updateStage = async ({ updates, shipment, stage }) => {
  let shouldRecalculateCosts;
  let shouldUpdateShipmentNotifications;

  const stageId = stage._id;
  const shipmentId = shipment._id;
  const stageObj = stage;
  const updatesD = dot.dot(updates); // dotted keys

  const shipmentUpdates = {};
  let shouldRefreshShipmentStatus;
  const stageUpdates = {
    ...pick(
      updatesD, // dotted keys
      "carrierId",
      "mode",
      "dates.pickup.arrival.planned",
      "dates.pickup.arrival.actual",
      "dates.pickup.departure.actual",
      "dates.delivery.arrival.planned",
      "dates.delivery.arrival.actual",
      "dates.delivery.departure.actual",
      "status"
    )
  };

  const stgCount = await Stage.count({ shipmentId });
  const sUpdates = {
    shouldUpdateShipmentMode: shouldUpdateShipmentMode(updatesD),
    stageShouldHaveStartedStatus: stageShouldHaveStartedStatus(stageUpdates),
    stageShouldHaveCompletedStatus: stageShouldHaveCompletedStatus(
      stageObj,
      updatesD
    ),
    isUpdatingPlannedPickupDate: isUpdatingPlannedPickupDate(
      stageObj,
      updatesD
    ),
    isUpdatingScheduledPickupDate: isUpdatingScheduledPickupDate(
      stageObj,
      updatesD
    ),
    isUpdatingActualPickupDate: isUpdatingActualPickupDate(stageObj, updatesD),

    isUpdatingPlannedDeliveryDate: isUpdatingPlannedDeliveryDate(
      stageObj,
      updatesD,
      stgCount
    ),
    isUpdatingScheduledDeliveryDate: isUpdatingScheduledDeliveryDate(
      stageObj,
      updatesD,
      stgCount
    ),
    isUpdatingActualDeliveryDate: isUpdatingActualDeliveryDate(
      stageObj,
      updatesD,
      stgCount
    )
  };

  debug("stage update triggers shipment updates: %o", sUpdates);

  if (sUpdates.shouldUpdateShipmentMode) {
    // mode has changed -> trigger type update in shipment
    const modes = (
      await Stage.where({ shipmentId }, { fields: { mode: 1 } })
    ).map(({ id, mode }) => (id === stageId ? updatesD.mode : mode));

    const shipmentType = modes.every(x => x === modes[0])
      ? modes[0]
      : TYPES_MULTI;
    shipmentUpdates.type = shipmentType;
  }

  if (sUpdates.stageShouldHaveStartedStatus) {
    stageUpdates.status = "started";
    shouldRefreshShipmentStatus = true;
  }
  if (sUpdates.stageShouldHaveCompletedStatus) {
    stageUpdates.status = "completed";
    shouldRefreshShipmentStatus = true;
  }

  // dates -> sync with shipment
  if (sUpdates.isUpdatingPlannedPickupDate) {
    shouldRecalculateCosts = true;
    shouldUpdateShipmentNotifications = true;
    shipmentUpdates["pickup.datePlanned"] =
      updatesD["dates.pickup.arrival.planned"];
  }
  if (sUpdates.isUpdatingScheduledPickupDate) {
    shipmentUpdates["pickup.dateScheduled"] =
      updatesD["dates.pickup.arrival.scheduled"];
  }
  if (sUpdates.isUpdatingActualPickupDate) {
    shouldRecalculateCosts = true;
    shouldUpdateShipmentNotifications = true;
    shipmentUpdates["pickup.dateActual"] =
      updatesD["dates.pickup.arrival.actual"];
  }
  if (sUpdates.isUpdatingPlannedDeliveryDate) {
    shouldRecalculateCosts = true;
    shouldUpdateShipmentNotifications = true;
    shipmentUpdates["delivery.datePlanned"] =
      updatesD["dates.delivery.arrival.planned"];
  }
  if (sUpdates.isUpdatingScheduledDeliveryDate) {
    // TODO [#372]: use scheduled date as well in (grouped) notifications e.g. will load
    // the 'shouldUpdateShipmentNotifications = true;' should be set
    // BUT: the handler should also look at scheduled dat then.
    shipmentUpdates["delivery.dateScheduled"] =
      updatesD["dates.delivery.arrival.scheduled"];
  }
  if (sUpdates.isUpdatingActualDeliveryDate) {
    shouldRecalculateCosts = true;
    shouldUpdateShipmentNotifications = true;
    shipmentUpdates["delivery.dateActual"] =
      updatesD["dates.delivery.arrival.actual"];
  }

  const hasShipmentUpdates = Object.keys(shipmentUpdates).length > 0;
  const hasStageUpdates = Object.keys(stageUpdates).length > 0;
  if (hasStageUpdates) {
    // need to go through model to trigger after_save
    await stage.update_async(stageUpdates);
  }

  // we set a flag in the shipment that the costs might be out of sync.
  const shouldSetFlag = shipment.priceListId && shouldRecalculateCosts;
  if (hasShipmentUpdates || shouldSetFlag) {
    await Shipment._collection.update(
      { _id: shipmentId },
      {
        ...(shipmentUpdates ? { $set: shipmentUpdates } : {}),
        ...(shouldSetFlag ? { $addToSet: { flags: "costs-not-in-sync" } } : {})
      }
    );
  }
  if (shouldRefreshShipmentStatus) {
    const s = await Shipment.first(shipmentId);
    await s.refreshStatus();
  }

  // job to check notifications [];
  if (shouldUpdateShipmentNotifications) {
    setShipmentNotificationFlags({ shipmentId }).updateAfterShipmentChange();
  }

  return { sUpdates, stage: stageObj };
};
