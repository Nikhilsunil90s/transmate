import { JobManager } from "/imports/utils/server/job-manager.js";
import { getReferenceNumber } from "/imports/api/shipments/utils.js";
import { getShipmentStakeholders } from "./functions/get-shipment-stakeholders";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { Shipment } from "/imports/api/shipments/Shipment";
import { Notification } from "/imports/api/notifications/Notification";
import { checkUserPreferenceDirect } from "./functions/checkUserPreferences";

const PREFERENCE_KEY = "shipment-delayed-notification";

// still used?
export const shipmentDelayedHook = ({ shipment, delayInMinutes }) => {
  const shipmentM = Shipment.init(shipment);
  const allStakeholderAccountIds = getShipmentStakeholders(shipmentM);
  return Promise.all(
    allStakeholderAccountIds.map(async accountId => {
      const users = await AllAccounts.getUsers_async(accountId, [
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
            event: "delayed",
            data: {
              shipmentId: shipment.id,
              number: getReferenceNumber(shipmentM),
              minutes: delayInMinutes
            }
          });
        })
      );
    })
  );
};

JobManager.on("shipment.delayed", "Notification", async notification => {
  const shipment = notification.object;
  const delayInMinutes = notification.info.delay;
  return shipmentDelayedHook({ shipment, delayInMinutes });
});
