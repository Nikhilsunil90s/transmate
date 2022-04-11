/* eslint-disable no-use-before-define */
import { JobManager } from "/imports/utils/server/job-manager.js";
import { Notification } from "/imports/api/notifications/Notification";
import { check } from "/imports/utils/check.js";
import { PriceRequest } from "../../../priceRequest/PriceRequest";
import { PriceList } from "/imports/api/pricelists/PriceList";
import { getPriceRequestAccountsData } from "./functions/get-price-request-accounts-data";
import { getPartnerContacts } from "./functions/get-partner-contacts";
import { PriceRequestUpdateMail } from "/imports/api/priceRequest/email/price-request-overview.js";

import { priceRequestService } from "/imports/api/priceRequest/services/priceRequest";
import { priceRequestBidService } from "/imports/api/priceRequest/services/priceRequestBid";

const debug = require("debug")("price-request.select:notifications");

export const PRICE_REQUEST_FIELDS = {
  customerId: 1,
  creatorId: 1,
  bidders: 1,
  items: 1
};

/** @typedef {import("../../../priceRequest/interfaces/priceRequest").BidderType} BidderType*/

// hook triggered from shipment after selecting a price option with an attached price requestId
// notifies all partners of won/lost
// multi-bids:
// - if no more open items -> put in archived status
//

export const priceRequestSelectedHook = async ({
  priceRequest,
  selectedPriceListId,
  selectedBidderId,
  shipmentId
}) => {
  check((priceRequest || {})._id, String);
  const {
    customer = {},
    bidders: bidderAccounts
  } = await getPriceRequestAccountsData(priceRequest);
  check(customer._id, String);
  check(bidderAccounts, Array);
  const logging = { mails: 0, bidders: 0, errors: [] };

  // to do : reduce the number of emails with multi bids
  // fully allocated pricerequest, send won/lost on price request level , ie Numidia
  // fully allocated  = single bid or multi bid mass allocation
  // partial allocation:
  // - confirm win/lost on price request level
  // - max 1/day ,
  // - trigger = new allocations

  const { name: accountName, _id: accountId } = customer;

  // add a stamp on the price request item itself
  await PriceRequest._collection.update(
    { _id: priceRequest._id, "items.shipmentId": shipmentId },
    {
      $set: {
        "items.$.allocation": {
          accountId: selectedBidderId,
          date: new Date()
        }
      }
    }
  );

  await priceRequest.reload();
  const multiShipmentPriceRequest = priceRequest.items?.length > 1;
  const multiRemainingOpen =
    (priceRequest.items || []).filter(({ allocation }) => !allocation).length >
    0;
  debug(multiRemainingOpen);

  const srv = priceRequestService({});
  await srv.init({ priceRequest });
  srv.allowShipmentAccess(false, [shipmentId]);

  // archive priceRequest if there are no more open items:
  if (!multiShipmentPriceRequest || !multiRemainingOpen) {
    debug("archive priceRequest %s", priceRequest._id);
    const updated = {
      by: `automated-${accountId}`,
      at: new Date()
    };
    await srv.update_async({ status: "archived", updated });
    srv.allowShipmentAccess(false);
  }

  if (bidderAccounts.length > 0) {
    // loop through bidders:
    await Promise.all(
      bidderAccounts.map(async bidderData => {
        logging.bidders = bidderAccounts.length;
        const bidderId = bidderData.id;
        debug(
          "check if selected bidder is %s = accountId %s, in pricerequest Id %s",
          selectedBidderId,
          bidderId,
          priceRequest._id
        );

        const { priceListId } = bidderData || {};
        const isWinner =
          bidderId === selectedBidderId &&
          (selectedPriceListId ? selectedPriceListId === priceListId : true);

        const { users } = await getPartnerContacts({
          partnerId: bidderId,
          users: bidderData.userIds,
          accountId
        });

        users.forEach(user => {
          logging.mails += 1;

          // do user actions
          createNotification({
            isWinner,
            user,
            data: {
              priceRequestId: priceRequest._id,
              account: accountName,
              title: priceRequest.title
            }
          });
        });

        // correct statusses on pricelist.
        debug("update %s to won?:", priceListId, isWinner);
        const priceList = await PriceList.first(priceListId, {
          fields: { status: 1 }
        });

        // if you are picked: automatically set your price list to "active"
        if (priceList && isWinner) {
          await priceList.update_async({ status: "active" });
          priceList.updateHistory("activate");
        }
        if (
          !isWinner &&
          priceList &&
          ["for-approval"].includes(priceList.status)
        ) {
          await priceList.update_async({ status: "declined" });
          priceList.updateHistory("decline");
        }

        // set flag on bid, legacy since this is on pr level  = not correct for multibids!
        try {
          await PriceRequest._collection.update(
            { _id: priceRequest._id, "bidders.accountId": bidderId },
            {
              $set: {
                [`bidders.$.${isWinner ? "won" : "lost"}`]: new Date(),
                updated: { by: "notification-server", at: new Date() }
              }
            }
          );

          // set flag on simple bid
          debug("set flag on shipmenid %s", shipmentId);
          await priceRequestBidService({ priceRequest, accountId: bidderId })
            .getMyBid()
            .setWinLost({ shipmentId, isWinner });
        } catch (error) {
          logging.errors.push(error);
        }
      })
    );
  }

  // after flags, check if we need to send an email
  debug("check if emails need to be send %s", priceRequest._id);
  await new PriceRequestUpdateMail(priceRequest._id).scheduleJob();

  return logging;
};

/**
 * hook triggered on "relase" in shipment stage -> checks if there is a price request
 * actions:
 * 1. notify winners & losers (mail + notification)
 * 2. set the status on the price-request to "closed"
 * 3. do custom actions
 */
JobManager.on("price-request.select", "UpdateAndMail", async notification => {
  const {
    priceRequestId,
    priceListId,
    selectedBidderId,
    shipmentId
  } = notification.object;
  debug("notification price-request.select called!", {
    priceRequestId,
    selectedBidderId,
    shipmentId
  });
  check(priceRequestId, String);
  check(selectedBidderId, String);
  check(shipmentId, String);

  // only id given, we need to get the full obj
  const priceRequest = await PriceRequest.first(priceRequestId, {
    fields: PRICE_REQUEST_FIELDS
  });
  if (priceRequest) {
    priceRequestSelectedHook({
      priceRequest,
      selectedPriceListId: priceListId,
      selectedBidderId,
      shipmentId
    });
  } else {
    console.error(priceRequestId, "price-request not found");
  }
});

const createNotification = ({ isWinner, user, data }) => {
  Notification.create({
    userId: user._id,
    type: "price-request",
    event: isWinner ? "bidWon" : "bidLost",
    data
  });
};
