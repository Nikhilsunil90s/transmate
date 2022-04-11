/* eslint-disable no-use-before-define */
import { check } from "/imports/utils/check.js";
import { JobManager } from "/imports/utils/server/job-manager.js";
import { Notification } from "/imports/api/notifications/Notification";
import { getPriceRequestAccountsData } from "./functions/get-price-request-accounts-data";
import { getPartnerContacts } from "./functions/get-partner-contacts";
import { sendPriceRequestEmail } from "../../../priceRequest/email/price-request-email";
import { setStatusPriceRequestBidder } from "./functions/updateBidderStatus";
import { PriceList } from "/imports/api/pricelists/PriceList";

const debug = require("debug")("price-request.cancelled:notification");

const createNotification = ({ user, data }) => {
  Notification.create({
    userId: user._id,
    type: "price-request",
    event: "cancelled",
    data
  });
};

/**
 * function to cancel pricerequest for one partner or all
 * @param {Object} priceRequest price request obj
 * @param {string} [partnerId]  optional patnerId obj (if partnerId is set is it only a cancel for that partner)
 */
export const priceRequestCancelledHook = async (priceRequest, partnerId) => {
  check(priceRequest._id, String);
  // eslint-disable-next-line new-cap
  const { customer, bidders = [] } = await getPriceRequestAccountsData(
    priceRequest
  );
  check(customer._id, String);
  check(bidders, Array);

  const logging = { mails: 0, bidders: 0 };
  const { name: accountName, _id: accountId } = customer;

  // check if it is only one to send to (partnerId given) , or all
  debug("partner id %s given? filter to 1 carrier if set!", partnerId);
  const filteredBidders = partnerId
    ? bidders.filter(el => el._id === partnerId)
    : bidders;

  if (filteredBidders.length > 0) {
    logging.bidders = filteredBidders.length;
    await Promise.all(
      filteredBidders.map(async bidderData => {
        const bidderDoc = priceRequest.bidders.find(
          el => el.accountId === bidderData.id
        );
        const { priceListId } = bidderDoc || {};

        // decline price lists for one or all carriers
        // correct statusses on pricelist.
        if (priceListId) {
          debug("update %s pricelist to declined", priceListId);
          const priceList = await PriceList.first(priceListId, {
            fields: { creatorId: 1 }
          });
          if (priceList) {
            await Promise.all([
              priceList.update_async({ status: "declined" }),
              priceList.updateHistory("decline")
            ]);
          }
        }

        // only send emails to notified bidders
        if (bidderDoc.notified) {
          debug("get partners of %o", bidderData.name);
          const { users } = await getPartnerContacts({
            partnerId: bidderData.id,
            users: bidderData.userIds,
            accountId
          });
          debug("users of partner %o %o", partnerId, users);
          await Promise.all(
            users.map(async user => {
              logging.mails += 1;

              // do user actions
              await createNotification({
                user,
                data: {
                  priceRequestId: priceRequest._id,
                  account: accountName,
                  title: priceRequest.title
                }
              });
              debug("send email");
              await sendPriceRequestEmail({
                user,
                bidder: bidderData,
                type: "cancel",
                accountId,
                accountName,
                priceRequest
              });
            })
          );
          debug("remove 'notified' on bidder %o", bidderData);
          // eslint-disable-next-line no-inner-declarations
          // unflag bidder <notified> in database
          await setStatusPriceRequestBidder({
            bidderId: bidderData.id,
            priceRequestId: priceRequest._id,
            unset: ["notified", "won", "bid", "lost", "bidOpened", "viewed"]
          });
          return true;
        }
        return true;
      })
    );
  }
  return logging;
};

JobManager.on(
  "price-request.cancelled",
  "StatusAndEmail",
  async notification => {
    debug("price-request.cancelled %o", notification.object);
    const { priceRequest, partnerId } = notification.object;
    return priceRequestCancelledHook(priceRequest, partnerId);
  }
);
