import { JobManager } from "/imports/utils/server/job-manager.js";
import { UserActivity } from "/imports/api/users/UserActivity";

/** called when shipment is created or duplicated */
JobManager.on("price-list.created", "UserActivity", async notification => {
  const { userId, accountId, priceListId } = notification.object;
  return UserActivity.saveActivity({
    userId,
    accountId,
    activity: "price-list.created",
    data: { priceListId }
  });
});
