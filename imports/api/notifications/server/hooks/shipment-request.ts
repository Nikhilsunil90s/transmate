import { JobManager } from "../../../../utils/server/job-manager";
import { Notification } from "/imports/api/notifications/Notification";
import { Shipment } from "/imports/api/shipments/Shipment";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";

import { getReferenceNumber } from "/imports/api/shipments/utils";
import { checkUserPreferenceDirect } from "./functions/checkUserPreferences";

const PREFERENCE_KEY = "shipment-request";
const DB_FIELDS = { references: 1, number: 1 };

export const shipmentRequestHook = async ({
  shipmentId,
  accountId,
  userId
}: {
  shipmentId: string;
  accountId: string;
  userId: string;
}) => {
  const shipment = await Shipment.first(shipmentId, { fields: DB_FIELDS });
  const shipmentReference = getReferenceNumber(shipment);

  // simple request email notification:

  const adminUsers = await AllAccounts.getUsers_async(accountId, ["admin"]);

  return Promise.all(
    adminUsers.map(async user => {
      const wantsNotification = checkUserPreferenceDirect(
        PREFERENCE_KEY,
        "app",
        user
      );
      const wantsEmailNotification = checkUserPreferenceDirect(
        PREFERENCE_KEY,
        "mail",
        user
      );
      if (!wantsNotification && !wantsEmailNotification) return null;

      return Notification.create_async({
        userId: user.id,
        type: "shipment",
        event: "requested",
        data: {
          shipmentId: shipment.id,
          number: shipmentReference,
          userId // this is the userId who has intiated it.
        }
      });
    })
  );
};

/** called when shipment request is released */
JobManager.on("shipment.request", "Notification", async notification => {
  const { userId, accountId, shipmentId } = notification.object;

  // we are triggering a notification to the account admin of the owning account for now:
  return shipmentRequestHook({ shipmentId, accountId, userId });
});
