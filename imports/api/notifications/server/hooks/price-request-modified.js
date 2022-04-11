import { JobManager } from "/imports/utils/server/job-manager.js";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { Notification } from "/imports/api/notifications/Notification";
import { PriceRequest } from "/imports/api/priceRequest/PriceRequest";

export const priceRequestModifiedHook = async ({ priceRequestId }) => {
  const priceRequest = await PriceRequest.first(priceRequestId, {
    fields: { title: 1, bidders: 1 }
  });

  return Promise.all(
    (priceRequest.bidders || []).map(async ({ accountId: bidderId }) => {
      const bidderUsers = await AllAccounts.getUsers_async(bidderId, [
        "core-priceRequest-update",
        "core-priceRequest-create"
      ]);
      return Promise.all(
        (bidderUsers || []).map(user => {
          // check status, (only open requests)
          // send notifications

          return Notification.create_async({
            userId: user.id,
            type: "price-request",
            event: "modifiedFromWorker",
            data: {
              priceRequestId,
              title: priceRequest.title
            }
          });
        })
      );
    })
  );
};

JobManager.on("price-request.modified", "Notification", async notification => {
  const { priceRequestId } = notification.object;
  return priceRequestModifiedHook({ priceRequestId });
});
