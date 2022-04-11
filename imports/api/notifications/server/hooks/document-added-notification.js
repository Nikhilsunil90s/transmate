import { JobManager } from "/imports/utils/server/job-manager.js";

import { getReferenceNumber } from "/imports/api/shipments/utils.js";
import { getShipmentUsers } from "./functions/get-shipment-users";
import { notCurrentUser } from "./functions/not-current-user";
import { Shipment } from "/imports/api/shipments/Shipment";
import { Notification } from "/imports/api/notifications/Notification";
import { oPath } from "../../../../utils/functions/path";
import { checkUserPreference } from "./functions/checkUserPreferences";

const PREFERENCE_KEY = "shipment-reference-notification";
const DB_FIELDS = { references: 1, number: 1, shipperId: 1, carrierIds: 1 };

export const documentAddedHook = async ({ document, userId }) => {
  const { shipmentId } = document;
  if (!shipmentId) return null;

  const shipment = await Shipment.first(shipmentId, { fields: DB_FIELDS });
  if (!shipment) return null;

  if (
    shipment.status === "draft" ||
    /^image/.test(oPath(["meta", "type"], document))
  )
    return null;

  const shipmentReferenceNumber = getReferenceNumber(shipment);
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
        if (!wantsNotification) return null;

        return Notification.create_async({
          userId: usr,
          type: "document",
          event: "added",
          data: {
            documentId: document.id,
            document: document.type,
            shipmentId: shipment.id,
            number: shipmentReferenceNumber
          }
        });
      })
  );
};

JobManager.on("document.added", "notification", async notification => {
  const document = notification.object;
  const { userId } = notification.info;
  return documentAddedHook({ document, userId });
});
