/* eslint-disable no-use-before-define */
import { check } from "/imports/utils/check.js";
import { JobManager } from "/imports/utils/server/job-manager.js";
import { Notification } from "/imports/api/notifications/Notification";
import { getPriceRequestAccountsData } from "./functions/get-price-request-accounts-data";
import { getPartnerContacts } from "./functions/get-partner-contacts";
import { startWorkflow } from "./functions/start-workflow";
import { setStatusPriceRequestBidder } from "./functions/updateBidderStatus";
import { sendPriceRequestEmail } from "../../../priceRequest/email/price-request-email";
import { PriceRequest } from "/imports/api/priceRequest/PriceRequest";

const debug = require("debug")("price-request.requested:notifications");

export const priceRequestRequestedHook = async priceRequest => {
  check(priceRequest._id, String);
  const {
    customer,
    bidders: bidderAccounts
  } = await getPriceRequestAccountsData(priceRequest);
  check((customer || {})._id, String);
  check(bidderAccounts, Array);

  const logging = {
    mails: 0,
    mailTo: [],
    bidders: 0,
    biddersAlreadyNotified: 0
  };
  const { name: accountName, _id: accountId } = customer;
  if (bidderAccounts.length > 0) {
    logging.bidders = bidderAccounts.length;
    await Promise.all(
      bidderAccounts.map(async bidderData => {
        const bidderId = bidderData.id;
        debug("bidderData detail %s %s ", bidderId, bidderData.name);

        // only send emails to bidderAccounts that were not notified before! check notified!
        if (bidderData.notified) {
          logging.biddersAlreadyNotified += 1;
        } else {
          debug(
            "bidderData was not yet nofitied, lets send mails to users %o",
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
              logging.mailTo.push(user.getEmail());
              createNotification({
                user,
                data: {
                  priceRequestId: priceRequest._id,
                  account: accountName,
                  title: priceRequest.title
                }
              });

              debug("send email to user:%s", user._id);
              await sendPriceRequestEmail({
                user,
                bidder: bidderData,
                type: "request",
                accountId,
                accountName,
                priceRequest
              });
            })
          );
          const userIds = users.map(({ _id }) => _id);
          debug(
            "set 'notified' on bidderData %o, userids %o",
            bidderId,
            userIds
          );

          // flag bidderData <notified> in database & set userids
          await setStatusPriceRequestBidder({
            bidderId,
            priceRequestId: priceRequest._id,
            set: ["notified"],
            unset: ["won", "lost", "bidOpened", "viewed", "bid"],
            userIds
          });

          // workflow - start manual task

          startWorkflow({ accountId: customer._id }).start({
            event: "price-request-requested",
            accountId: bidderId, // accountId of target executor
            initiatorId: customer._id,
            data: {
              userIds,
              dueDate: priceRequest.dueDate,
              customerId: customer._id,
              customerName: customer.name
            },
            references: { id: priceRequest._id, type: "priceRequest" }
          });
        }
        return true;
      })
    );
  }
  return logging;
};

JobManager.on("price-request.requested", "Workflow", async notification => {
  const priceRequest = PriceRequest.init(notification.object);
  await priceRequestRequestedHook(priceRequest);
});

const createNotification = ({ user, data }) => {
  Notification.create({
    userId: user._id,
    type: "price-request",
    event: "requested",
    data
  });
};
