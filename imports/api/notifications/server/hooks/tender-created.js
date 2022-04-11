import { JobManager } from "/imports/utils/server/job-manager.js";
import { UserActivity } from "/imports/api/users/UserActivity";

/** called when shipment is created or duplicated */
JobManager.on("tender.created", "saveActivity", async notification => {
  const { userId, accountId, tenderId } = notification.object;
  return UserActivity.saveActivity({
    userId,
    accountId,
    activity: "tender.created",
    data: { tenderId }
  });
});
