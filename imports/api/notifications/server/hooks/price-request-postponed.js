import { JobManager } from "/imports/utils/server/job-manager.js";

import { PriceRequest } from "/imports/api/priceRequest/PriceRequest";
import { getPartnerContacts } from "./functions/get-partner-contacts";

export const priceRequestPostponedHook = async ({
  priceRequestId,
  dueDate
}) => {
  const logging = {};
  const priceRequest = await PriceRequest.first(priceRequestId);
  const itemIds = (priceRequest.items || []).map(
    ({ shipmentId }) => shipmentId
  );

  // only bidders that have not placed a bit should be notified:
  return Promise.all(
    priceRequest.bidders
      .filter(
        bidder =>
          !bidder.bid ||
          !itemIds.every(shipmentId =>
            (bidder.simpleBids || []).find(
              ({ shipmentId: id }) => id === shipmentId
            )
          )
      )
      .map(async ({ accountId: partnerId, name, userIds }) => {
        const { users } = await getPartnerContacts({
          partnerId,
          users: userIds,
          accountId: partnerId
        });

        await Promise.all(
          users.map(user => {
            logging.mails += 1;

            return Notification.create_async({
              userId: user._id,
              type: "price-request",
              event: "postponed",
              data: {
                priceRequestId,
                account: name,
                title: priceRequest.title,
                dueDate
              }
            });

            // TODO [#284]: send a notification or so that the deadline has been postponed

            // TODO extend tasks deadline
          })
        );
      })
  );
};

JobManager.on("price-request.postponed", notification => {
  const { accountId, priceRequestId, dueDate } = notification.object;
  return priceRequestPostponedHook({ accountId, priceRequestId, dueDate });
});
