/* eslint-disable no-use-before-define */
import { JobManager } from "/imports/utils/server/job-manager.js";

import { Shipment } from "/imports/api/shipments/Shipment";

const debug = require("debug")("notifications:stage-relase");

const SHIPMENT_FIELDS = { priceRequestId: 1, carrierIds: 1, priceListId: 1 };

// TODO [#244]: on stage release notification determine what to do when there are multiple stages?
// we assume for now carrierIds[0] is the one...

/**
 * on stage/ shipment release (triggered on stage)
 *
 * 1. check if there are price requests open -> change status
 * 2. notify winners & losers
 * 3. if no price request -> notification to accept the shipment
 * 4. custom actions for Numidia
 * @param {{shipmentId: string; stageId: string; stageCount: number}} param0
 */
export const shipmentStageReleasedHook = async ({
  shipmentId,
  stageId,
  stageCount
}) => {
  const shipment = await Shipment.first(shipmentId, {
    fields: SHIPMENT_FIELDS
  });
  const { priceRequestId, priceListId, carrierIds = [] } = shipment || {};

  debug("shipment-stage.released %o", {
    shipmentId,
    stageId,
    stageCount,
    priceRequestId,
    carrierIds
  });

  if (priceRequestId && carrierIds[0]) {
    const selectedBidderId = carrierIds[0];
    JobManager.post("price-request.select", {
      priceRequestId,
      priceListId,
      selectedBidderId,
      shipmentId
    });
  } else {
    // actions to notify the carrier the stage was confirmed to him (he will need to confirm)
  }
};

JobManager.on(
  "shipment-stage.released",
  "shipment-stage-released-notification",
  async notification => {
    const {
      shipmentId,
      stageId,
      stageCount

      // accountId,
      // userId
    } = notification.object;

    return shipmentStageReleasedHook({ shipmentId, stageId, stageCount });
  }
);
