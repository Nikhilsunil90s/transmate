import { JobManager } from "/imports/utils/server/job-manager.js";
import { UserActivity } from "/imports/api/users/UserActivity";
import { PriceRequest } from "/imports/api/priceRequest/PriceRequest";

/** called when shipment is created or duplicated */
JobManager.on("price-request.created", "saveActivity", async notification => {
  const { userId, accountId, priceRequestId } = notification.object;
  const priceRequest = await PriceRequest.first(priceRequestId);
  return UserActivity.saveActivity({
    userId,
    accountId,
    activity: "price-request.created",
    data: { priceRequestId, title: priceRequest.title }
  });
});
