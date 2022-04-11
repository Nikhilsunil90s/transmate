import { JobManager } from "/imports/utils/server/job-manager.js";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { Notification } from "/imports/api/notifications/Notification";
import { PriceRequest } from "/imports/api/priceRequest/PriceRequest";

export const onBidClosedNotification = async (priceRequestId, hasBids) => {
  const priceRequest = await PriceRequest.first(priceRequestId);

  const users = await AllAccounts.getUsers_async(priceRequest.creatorId, [
    "core-priceRequest-update",
    "core-priceRequest-create"
  ]);

  await Promise.all(
    users.map(user =>
      Notification.create_async({
        userId: user.id,
        type: "price-request",
        event: hasBids ? "ended" : "endedWithoutBids",
        data: {
          priceRequestId
        }
      })
    )
  );
};

JobManager.on("bid.closed", "Notification", async notification => {
  const { priceRequestId, hasBids } = notification.object;
  return onBidClosedNotification(priceRequestId, hasBids);
});
