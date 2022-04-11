import { JobManager } from "/imports/utils/server/job-manager.js";
import { getReferenceNumber } from "/imports/api/shipments/utils.js";
import { getShipmentUsers } from "./functions/get-shipment-users";
import { notCurrentUser } from "./functions/not-current-user";
import { Shipment } from "/imports/api/shipments/Shipment";
import { Notification } from "/imports/api/notifications/Notification";
import { checkUserPreference } from "./functions/checkUserPreferences";

const PREFERENCE_KEY = "shipment-note-notification";

// NOT USED ANYMORE??
JobManager.on("shipment.note", "Notification", async notification => {
  const shipment = Shipment.init(notification.object);
  if (shipment.status !== "draft") {
    const shipmentUsers = await getShipmentUsers(shipment);
    await Promise.all(
      shipmentUsers.filter(notCurrentUser).map(async userId => {
        if (await checkUserPreference(PREFERENCE_KEY, "app", userId)) {
          Notification.create({
            userId,
            type: "shipment",
            event: "note",
            data: {
              shipmentId: shipment.id,
              number: getReferenceNumber(shipment),
              note: notification.info.note
            }
          });
        }
      })
    );
    return "done";
  }
  return null;
});
