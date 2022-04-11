import { check } from "/imports/utils/check.js";
import { PriceRequest } from "/imports/api/priceRequest/PriceRequest";

const debug = require("debug")("price-request.bidder.flags");

// some keys are TS, some keys are boolean
const TS_MAP = {
  notified: "date",
  won: "date",
  lost: "date",
  bidOpened: "date",
  viewed: "boolean",
  bid: "boolean"
};

/** @typedef {"notified" | "won" | "bid" | "lost" | "bidOpened" | "viewed"} NotificationTopic */

/** @param {{priceRequestId: string; bidderId: string; set:Array<NotificationTopic>, unset:Array<NotificationTopic>, userIds: Array<string}} param0 */
export const setStatusPriceRequestBidder = ({
  priceRequestId,
  bidderId,
  set = [],
  unset = [],
  userIds
}) => {
  // set bidder status on changes
  check(priceRequestId, String);
  check(bidderId, String);
  check(set, Array);
  check(unset, Array);
  debug("got update req: %o", { set, unset });
  const setObj = { updated: { by: "notification-server", at: new Date() } };
  if (userIds) {
    setObj[`bidders.$.userIds`] = userIds;
  }

  set.forEach(el => {
    let setVal = true;
    if (TS_MAP[el] === "date") {
      setVal = new Date();
    }
    setObj[`bidders.$.${el}`] = setVal;
  });
  const unsetObj = {};

  // remove items from unset that are in set, to avoid mongo issues
  const unsetFiltered = unset.filter(el => !set.includes(el));
  unsetFiltered.forEach(el => {
    unsetObj[`bidders.$.${el}`] = null;
  });
  debug("update db %o", {
    priceRequestId,
    bidderId,
    set,
    unset,
    $set: setObj,
    $unset: unsetObj
  });
  return PriceRequest._collection.update(
    { _id: priceRequestId, "bidders.accountId": bidderId },
    {
      ...(set.length ? { $set: setObj } : {}),
      ...(unsetFiltered.length ? { $unset: unsetObj } : {})
    }
  );
};
