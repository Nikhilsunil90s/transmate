import { JobManager } from "/imports/utils/server/job-manager.js";
import { UserActivity } from "/imports/api/users/UserActivity";

/** called when shipment is created or duplicated */
JobManager.on("shipment.created", "UserActivity", async notification => {
  const { userId, accountId, shipmentId } = notification.object;
  return UserActivity.saveActivity({
    userId,
    accountId,
    activity: "shipment.created",
    data: { shipmentId }
  });
});
