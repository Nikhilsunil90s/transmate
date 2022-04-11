import { JobManager } from "/imports/utils/server/job-manager.js";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { Notification } from "/imports/api/notifications/Notification";
import { getReferenceNumber } from "/imports/api/shipments/utils.js";
import { checkUserPreferenceDirect } from "./functions/checkUserPreferences";

const PREFERENCE_KEY = "shipment-received-notification";

// FIXME: still in use?
export const shipmentReceivedHook = async ({ shipment, carrier }) => {
  // Administrators and planners of the assigned carrier
  const users = await AllAccounts.getUsers_async(carrier.id, [
    "core-shipment-update",
    "core-shipment-create"
  ]);

  const shipperName = (await shipment.getShipper())?.getName();
  const referenceNumber = getReferenceNumber(shipment);
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
        event: "received",
        data: {
          shipmentId: shipment.id,
          number: referenceNumber,
          account: shipperName
        }
      });
    })
  );
};

// FIXME: not triggered anywhere?
JobManager.on("shipment.received", "Notification", async notification => {
  const shipment = notification.object;
  const { carrier } = notification.info;
  return shipmentReceivedHook({ shipment, carrier });
});
