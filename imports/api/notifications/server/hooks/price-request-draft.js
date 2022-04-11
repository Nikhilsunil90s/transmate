/* eslint-disable no-use-before-define */
import { check } from "/imports/utils/check.js";
import { JobManager } from "/imports/utils/server/job-manager.js";
import { Notification } from "/imports/api/notifications/Notification";

import { getPriceRequestAccountsData } from "./functions/get-price-request-accounts-data";
import { getPartnerContacts } from "./functions/get-partner-contacts";
import { startWorkflow } from "./functions/start-workflow";
import { sendPriceRequestEmail } from "../../../priceRequest/email/price-request-email";
import { setStatusPriceRequestBidder } from "./functions/updateBidderStatus";

const debug = require("debug")("price-request.draft:notifications");

const createNotification = ({ user, data }) => {
  Notification.create({
    userId: user._id,
    type: "price-request",
    event: "suspended",
    data
  });
};

// export for testing
export const priceRequestDraftHook = async priceRequest => {
  check(priceRequest._id, String);
  const {
    customer,
    bidders: bidderAccounts
  } = await getPriceRequestAccountsData(priceRequest);
  check(customer._id, String);
  check(bidderAccounts, Array);
  const logging = { mails: 0, bidders: 0 };

  if (bidderAccounts.length > 0) {
    logging.bidders = bidderAccounts.length;
    const { name: accountName, _id: accountId } = customer;

    await Promise.all(
      bidderAccounts.map(async bidderData => {
        const bidderId = bidderData.id;

        // only send emails to bidders that have received an email...normally every
        // to let them know this bid is suspended
        debug(
          "bidder detail %s %s notified ?%o",
          bidderId,
          bidderData.name,
          bidderData.notified
        );
        if (bidderData.notified) {
          debug(
            "bidder was nofitied, lets send mails to users %o",
            bidderData.userIds
          );
          const { users } = await getPartnerContacts({
            partnerId: bidderId,
            users: bidderData.userIds,
            accountId
          });
          debug("found users for %s %o", bidderId, users);

          await Promise.all(
            users.map(async user => {
              logging.mails += 1;
              createNotification({
                user,
                data: {
                  priceRequestId: priceRequest._id,
                  account: accountName,
                  title: priceRequest.title
                }
              });
              await sendPriceRequestEmail({
                user,
                bidder: bidderData,
                type: "suspend",
                accountId,
                accountName,
                priceRequest
              });
              return true;
            })
          );

          // unflag bidder <notified> in database
          await setStatusPriceRequestBidder({
            bidderId,
            priceRequestId: priceRequest._id,
            unset: ["notified"]
          });

          // workflow - start manual task
          const userIds = users.map(({ _id }) => _id);
          debug("start workflow with %o", {
            userIds,
            references: { id: priceRequest._id, type: "priceRequest" }
          });
          startWorkflow({ accountId: customer._id }).start({
            event: "price-request.draft",
            accountId: bidderId, // accountId of target executor
            initiatorId: customer._id,
            userIds,
            references: { id: priceRequest._id, type: "priceRequest" }
          });
        }
      })
    );
  }
  return logging;
};

JobManager.on("price-request.draft", "Workflow", async notification => {
  const priceRequest = notification.object;
  return priceRequestDraftHook(priceRequest);
});
