import { JobManager } from "/imports/utils/server/job-manager.js";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { Shipment } from "/imports/api/shipments/Shipment";
import { Notification } from "/imports/api/notifications/Notification";

import { getReferenceNumber } from "/imports/api/shipments/utils";
import { checkUserPreferenceDirect } from "./functions/checkUserPreferences";

const debug = require("debug")("shipments:notifications-canceled");

const PREFERENCE_KEY = "shipment-canceled-notification";
const DB_FIELDS = { carrierIds: 1, references: 1, number: 1 };

export const shipmentCanceledHook = async ({ shipmentId }) => {
  const shipment = await Shipment.first(shipmentId, { fields: DB_FIELDS });
  const { carrierIds = [] } = shipment;
  const shipmentReference = getReferenceNumber(shipment);

  debug("send carriers a notification, %o", carrierIds);
  return Promise.all(
    carrierIds.map(async carrierId => {
      // Administrators and planners of the assigned carrier
      const users = await AllAccounts.getUsers_async(carrierId, [
        "core-shipment-update",
        "core-shipment-create"
      ]);

      return Promise.all(
        users.map(async user => {
          const wantsNotification = checkUserPreferenceDirect(
            PREFERENCE_KEY,
            "app",
            user
          );
          if (!wantsNotification) return null;

          return Notification.create_async({
            userId: user.id,
            type: "shipment",
            event: "canceled",
            data: {
              shipmentId: shipment.id,
              number: shipmentReference
            }
          });
        })
      );
    })
  );
};

JobManager.on("shipment.canceled", "Notification", async notification => {
  const shipmentId = notification.object;
  return shipmentCanceledHook({ shipmentId });
});
