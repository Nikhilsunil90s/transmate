import { JobManager } from "/imports/utils/server/job-manager.js";
import { getReferenceNumber } from "/imports/api/shipments/utils.js";
import { getShipmentUsers } from "./functions/get-shipment-users";
import { notCurrentUser } from "./functions/not-current-user";
import { Shipment } from "/imports/api/shipments/Shipment";
import { Notification } from "/imports/api/notifications/Notification";
import { checkUserPreference } from "./functions/checkUserPreferences";

const PREFERENCE_KEY = "non-conformance-added-notification";

JobManager.on("non-conformance.added", "Notification", async notification => {
  const nonConformance = notification.object;
  const shipment = await Shipment.first(
    {
      _id: nonConformance.shipmentId
    },
    {
      fields: { _id: 1, accountId: 1, shipperId: 1, carrierIds: 1 }
    }
  );
  if (shipment.status !== "draft") {
    const shipmentUsers = await getShipmentUsers(shipment);
    await Promise.all(
      shipmentUsers.filter(notCurrentUser).map(async userId => {
        if (await checkUserPreference(PREFERENCE_KEY, "app", userId)) {
          await Notification.create({
            userId,
            type: "non-conformance",
            event: "added",
            data: {
              nonConformanceId: nonConformance.id,
              shipmentId: shipment.id,
              number: getReferenceNumber(shipment)
            }
          });
        }
      })
    );
  }
  return "all notifications send!";
});
