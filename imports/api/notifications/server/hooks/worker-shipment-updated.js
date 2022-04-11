import { JobManager } from "/imports/utils/server/job-manager.js";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { Notification } from "/imports/api/notifications/Notification";

JobManager.on(
  "worker.shipments.updated",
  "Notification",
  async ({ accountId, numberOfShipments }) => {
    return AllAccounts.getUsers_async(accountId).then(async users =>
      users.map(user => {
        return Notification.create({
          userId: user.id,
          type: "shipment",
          event: "updatedFromWorker",
          data: {
            numberOfShipments
          }
        });
      })
    );
  }
);
