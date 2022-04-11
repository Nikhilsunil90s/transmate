import { JobManager } from "/imports/utils/server/job-manager.js";

import { getReferenceNumber } from "/imports/api/shipments/utils.js";
import { getShipmentUsers } from "./functions/get-shipment-users";

import { notCurrentUser } from "./functions/not-current-user";

import { Shipment } from "/imports/api/shipments/Shipment";
import { Notification } from "/imports/api/notifications/Notification";
import { checkUserPreference } from "./functions/checkUserPreferences";

const PREFERENCE_KEY = "shipment-reference-notification";
const SHIPMENT_FIELDS = {
  status: 1,
  shipperId: 1,
  carrierIds: 1,
  number: 1,
  references: 1
};

/** @param {{shipmentId: string, reference: string, userId: string}} param0*/
export const shipmentReferenceHook = async ({
  shipmentId,
  reference,
  userId
}) => {
  const shipment = await Shipment.first(shipmentId, {
    fields: SHIPMENT_FIELDS
  });
  if (shipment.status === "draft") return null;
  const users = await getShipmentUsers(shipment);

  return Promise.all(
    users
      .filter(usr => notCurrentUser(usr, userId))
      .map(async usr => {
        const wantsNotification = await checkUserPreference(
          PREFERENCE_KEY,
          "app",
          usr
        );
        if (wantsNotification) {
          await Notification.create_async({
            userId: usr,
            type: "shipment",
            event: "reference",
            data: {
              shipmentId: shipment.id,
              number: getReferenceNumber(shipment),
              reference
            }
          });
        }
        return null;
      })
  );
};

JobManager.on("shipment.reference", "Notification", async notification => {
  const shipmentId = notification.object;
  const { reference, userId, accountId } = notification.info;
  return shipmentReferenceHook({ shipmentId, reference, userId, accountId });
});
