import { JobManager } from "/imports/utils/server/job-manager.js";
import { UserActivity } from "/imports/api/users/UserActivity";

/** called when shipment is created or duplicated */
JobManager.on("tools.route-insight", "saveActivity", async notification => {
  const { userId, accountId, data } = notification.object;
  return UserActivity.saveActivity({
    userId,
    accountId,
    activity: "tools.route-insight",
    data
  });
});
