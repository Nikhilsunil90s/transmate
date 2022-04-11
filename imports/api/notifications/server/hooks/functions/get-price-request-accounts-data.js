import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { User } from "/imports/api/users/User";

const debug = require("debug")("price-request:getPriceRequestAccountsData");

/** @param {any} priceRequest */
export const getPriceRequestAccountsData = async priceRequest => {
  if (!priceRequest) throw new Error("No price request doc");
  const biddersInPriceRequest = priceRequest.bidders || [];
  const bidderIds = biddersInPriceRequest.map(({ accountId }) => accountId);
  const bidderUserIds = biddersInPriceRequest.reduce(
    (acc, { userIds = [] }) => [...acc, ...userIds],
    []
  );

  const [customer, bidders] = await Promise.all([
    AllAccounts.first(
      { _id: priceRequest.customerId },
      { fields: { name: 1 } }
    ),
    AllAccounts.where(
      { _id: { $in: bidderIds } },
      AllAccounts.publishMyFields({
        accountId: priceRequest.customerId
      })
    )
  ]);

  const bidderUsers = await User.where(
    { _id: { $in: bidderUserIds } },
    { fields: { services: 0 } }
  );
  debug(
    "getPriceRequestAccountsData:bidderUserIds %o , users found %o",
    bidderUserIds,
    (bidderUsers || []).length
  );

  // remove list of userids of account, only look at bidObj (that has a userId!!)
  // (sometimes this will be set sometimes not, don't send to all users of account!)
  const bidderMap = bidders.map(({ userIds, ...bidder }) => {
    const bidObj = biddersInPriceRequest.find(
      ({ accountId }) => accountId === bidder.id
    );

    return { ...bidObj, ...bidder };
  });

  return { customer, bidders: bidderMap, bidderUsers };
};
