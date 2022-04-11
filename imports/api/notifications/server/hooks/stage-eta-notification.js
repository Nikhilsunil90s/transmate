import get from "lodash.get";
import { JobManager } from "/imports/utils/server/job-manager.js";
import moment from "moment";
import { getReferenceNumber } from "/imports/api/shipments/utils";
import { getShipmentPlanners } from "./functions/get-shipment-planners";

import { Shipment } from "/imports/api/shipments/Shipment";
import { Notification } from "/imports/api/notifications/Notification";

const NOTIFICATION_TRESHOLD = 15; // can also be defined in carrier/user settings in the future
const SHIPMENT_FIELDS = {
  plannerIds: 1,
  accountId: 1,
  number: 1,
  "references.number": 1
};

// FIXME: NOT COVERED BY TEST
export const stageEtaNotification = async ({ stage, eta }) => {
  if (!stage.shipmentId) return null;
  const shipment = await Shipment.first(stage.shipmentId, {
    fields: SHIPMENT_FIELDS
  });

  const shipmentReferenceNumber = getReferenceNumber(shipment);
  if (!get(stage, ["dates", "delivery", "arrival", "planned"])) return null;

  const planned = moment(stage.dates.delivery.arrival.planned);
  const etaM = moment(eta);
  const minutes = etaM.diff(planned, "minutes");
  const shipmentPlanners = await getShipmentPlanners(shipment);
  return Promise.all(
    shipmentPlanners.map(async userId => {
      // Mute notifications for 30 minutes after triggering
      const recentlyNotified = await Notification.first({
        created: {
          $gte: moment()
            .subtract(30, "m")
            .toDate()
        },
        userId,
        type: "stage",
        event: minutes > NOTIFICATION_TRESHOLD ? "late" : "eta",
        "data.shipmentId": shipment.id
      });
      if (recentlyNotified) {
        return;
      }
      await Notification.create_async({
        userId,
        type: "stage",
        event: minutes > NOTIFICATION_TRESHOLD ? "late" : "eta",
        data: {
          shipmentId: shipment.id,
          number: shipmentReferenceNumber,
          count: minutes
        }
      });
    })
  );
};

// FIXME: triggered by shipment.setEta() -> not triggered anywhere??
JobManager.on("stage.eta", "Notification", async notification => {
  const stage = notification.object;
  const { eta } = notification.info;
  return stageEtaNotification({ stage, eta });
});
