import { JobManager } from "/imports/utils/server/job-manager.js";
import { UserActivity } from "/imports/api/users/UserActivity";

/** called when shipment is created or duplicated */
JobManager.on("partner.created", "saveActivity", async notification => {
  const { userId, accountId, partnerId } = notification.object;
  return UserActivity.saveActivity({
    userId,
    accountId,
    activity: "partner.created",
    data: { partnerId }
  });
});
