import get from "lodash.get";
import { User } from "../../users/User";
import { PriceRequest } from "../PriceRequest";
import { EdiJobs } from "/imports/api/jobs/Jobs";

const debug = require("debug")("price-request:helper");

debug("price request helper loaded");
export const priceRequestHelpers = {
  getRequestedByName(user) {
    if (user) {
      return User.init(user).getName();
    }
    return undefined;
  },

  viewActivePriceRequests({ accountId }) {
    let timeLimit = {};
    const today = new Date();

    // allow carriers to see old(expired) price request for 1 week.
    const lastWeek = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 7
    );
    timeLimit = { dueDate: { $gte: lastWeek } };

    const query = {
      $or: [
        {
          deleted: false,
          creatorId: accountId,
          status: {
            $nin: ["deleted"]
          }
        },
        {
          deleted: false,
          customerId: accountId,
          status: {
            $nin: ["deleted", "draft"]
          }
        },
        {
          deleted: false,
          "bidders.accountId": accountId,
          status: { $in: ["requested", "archived", "closed"] },
          ...timeLimit
        }
      ]
    };
    debug("return match %j", query);
    return query;
  },
  enrich(priceRequest, accountId) {
    debug("start enrich");

    // is this account the requester
    const { bidders = [], user } = priceRequest || {};
    const requester =
      accountId &&
      [priceRequest.accountId, priceRequest.customerId].includes(accountId);
    const ref = PriceRequest.init(priceRequest).ref(priceRequest);

    // debug(
    //   "bidders",
    //   bidders.find(bidder => bidder.accountId === accountId)
    // );

    // bidder extra info
    const { bid, won, lost } = requester
      ? {}
      : bidders.find(bidder => bidder.accountId === accountId) || {};

    // requester extra info
    const bids = requester
      ? bidders.filter(bidder => bidder.bid).length
      : undefined;
    const wons = requester
      ? bidders.filter(bidder => bidder.won).length
      : undefined;
    const biddersInRequest = requester ? bidders.length : undefined;

    // both: add partners name or customer name for bidders
    const partners = requester
      ? bidders.map(({ name }) => name).join(", ")
      : priceRequest.customer.name;

    // bidder : delete bidder array (bidder should not see the other bidders)
    // keep the bidder array as this is used for security checks
    if (!requester) {
      priceRequest.bidders = bidders.filter(
        bidder => bidder.accountId === accountId
      );

      // delete data not needed for bidder
      delete priceRequest.calculation;
      delete priceRequest.analyseData;
    }
    debug("end enrich");
    return {
      ...priceRequest,
      partners,
      ref,
      requester,
      bid,
      won,
      lost,
      bids,
      wons,
      biddersInRequest,
      requestedByName: priceRequestHelpers.getRequestedByName(user)
    };
  },

  async addTokens(priceRequest) {
    debug("start add tokens for id %o", priceRequest._id);

    const jobs = await await EdiJobs.getPrTokens({
      priceRequestId: priceRequest._id
    });
    if (Array.isArray(jobs)) {
      debug("# jobs for pr %o", jobs.length);
      priceRequest.bidders.forEach((bidder, bidderIndex) => {
        bidder.contacts.forEach((contact, contactIndex) => {
          // get last token
          const job = jobs.find(
            el =>
              get(el, "data.input.meta.userId", "NA") === contact.linkedId &&
              get(el, "data.input.meta.accountId", "NA") === bidder.accountId
          );
          if (job) {
            debug("job found %o", job);
            priceRequest.bidders[bidderIndex].contacts[
              contactIndex
            ].token = get(job, "data.input.data.token", undefined);
          }
        });
      });
    }

    return priceRequest;
  }
};
