import { JobManager } from "/imports/utils/server/job-manager.js";
import { UserActivity } from "/imports/api/users/UserActivity";

/** called when shipment is created or duplicated */
JobManager.on(
  "shipment-project.created",
  "Notification",
  async notification => {
    const { userId, accountId, projectId } = notification.object;
    return UserActivity.saveActivity({
      userId,
      accountId,
      activity: "shipment-project.created",
      data: { projectId }
    });
  }
);
