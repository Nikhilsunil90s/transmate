import { JobManager } from "/imports/utils/server/job-manager.js";
import { UserActivity } from "/imports/api/users/UserActivity";

/** called when shipment is created or duplicated */
JobManager.on("analysis.created", "saveActivity", async notification => {
  const { userId, accountId, analysisId, type } = notification.object;
  return UserActivity.saveActivity({
    userId,
    accountId,
    activity: "analysis.created",
    data: { analysisId, type }
  });
});
