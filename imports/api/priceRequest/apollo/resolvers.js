import SecurityChecks from "/imports/utils/security/_security";
import { PriceRequest } from "../PriceRequest";

import {
  createPriceRequest,
  updatePriceRequest,
  setBidderTimeStamp,
  updateStatus,
  addMatchingBidders,
  updateBidders,
  placeSimpleBid,
  addItemsToRequest
} from "../services/_mutations";

import {
  getPriceRequest,
  getPriceRequestItems,
  priceRequestView,
  getPriceRequestSummary
} from "../services/_queries";
import { getPriceRequestBids } from "../services/resolver.getPriceRequestBids";

import { priceRequestService } from "../services/priceRequest";

const debug = require("debug")("apollo:resolvers");

export const resolvers = {
  PriceRequest: {
    /** will filter bidder array & setup simpleBid for bidder */
    bidders: async (priceRequest, args, context) => {
      const bidders = await getPriceRequestBids({
        ...context,
        priceRequest
      }).get();
      return bidders;
    }
  },
  Query: {
    async getPriceRequest(root, args = {}, context) {
      const { accountId, userId, roles } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { priceRequestId } = args;

      try {
        const request = await getPriceRequest({ userId, accountId, roles }).get(
          {
            priceRequestId,
            accountId
          }
        );

        return request;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async getOpenPriceRequests(root, args, context) {
      try {
        const { accountId } = context;
        debug("getOpenPriceRequests accountId? %o", accountId);
        const priceRequests = await PriceRequest.where(
          {
            creatorId: accountId,
            status: { $nin: ["archived", "deleted"] }
          },
          { fields: { title: 1, "created.at": 1 } }
        );

        return priceRequests.map(request => {
          return {
            id: request._id,
            title: request.title || PriceRequest.ref(request)
          };
        });
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async getPriceRequestItems(root, args = {}, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { priceRequestId } = args;
      return getPriceRequestItems({ accountId, userId }).get({
        priceRequestId
      });
    },
    async getPriceRequestView(root, args = {}, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { viewKey, filters } = args.input || {};

      return priceRequestView({ accountId, userId }).get({
        viewKey,
        filters
      });
    },
    async getPricerequestSummary(root, args = {}, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);
      const { shipmentId } = args;

      return getPriceRequestSummary({ userId, accountId }).get({ shipmentId });
    },
    async getPriceRequestInsights(root, args, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { priceRequestId } = args;

      return getPriceRequest({ userId, accountId }).getInsights({
        priceRequestId
      });
    }
  },
  Mutation: {
    async createPriceRequest(root, args, context) {
      debug("createPriceRequest %o", { root, args, context });
      const { userId, accountId } = context;
      const { items, ...data } = args;

      try {
        SecurityChecks.checkLoggedIn(userId);

        const res = await createPriceRequest({ accountId, userId })
          .verifyItems({ items })
          .create({ data });

        return res;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async updatePriceRequest(root, args, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);
      const { priceRequestId, update } = args.input;

      const srv = updatePriceRequest({ accountId, userId });
      await srv.init({ priceRequestId });
      await srv.update({ update });
      return srv.getUIResponse();
    },
    async addItemsToRequest(root, args, context) {
      const { userId, accountId } = context;
      const { items, priceRequestId } = args.input;

      SecurityChecks.checkLoggedIn(userId);

      const srv = addItemsToRequest({ accountId, userId });
      await srv.init({ priceRequestId });
      await srv.add({ items });
      return srv.getUIResponse();
    },
    async updateBidderTSPriceRequest(root, args, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);
      const { priceRequestId } = args;

      const srv = setBidderTimeStamp({ accountId, userId });
      await srv.init({ priceRequestId });
      await srv.setTS();
      return priceRequestId;
    },
    async updatePriceRequestStatus(root, args, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);
      const { priceRequestId, action } = args.input;

      const srv = updateStatus({ userId, accountId });
      await srv.init({ priceRequestId });
      await srv.updateStatus({ action });
      return srv.getUIResponse();
    },
    async addMatchingBiddersPriceRequest(root, args, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);
      const { priceRequestId } = args;
      const srv = addMatchingBidders({ accountId, userId });
      await srv.init({ priceRequestId });
      await srv.findMatchingBidders();
      return srv.getUIResponse();
    },
    async postponePriceRequest(root, args, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);
      const { priceRequestId, dueDate } = args.input;

      // async call don't expect a return. (calls a cloud function)
      const srv = priceRequestService({ accountId });
      await srv.init({ priceRequestId });
      await srv.postponeDeadline({ dueDate });
      return srv.get();
    },
    async updatePriceRequestBidders(root, args, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);
      const { priceRequestId, partnerIds } = args.input;

      const srv = updateBidders({ accountId, userId });
      await srv.init({ priceRequestId });
      await srv.update({ partnerIds });
      return srv.getUIResponse();
    },
    async placeSimpleBidPriceRequest(root, args, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);
      const { priceRequestId, items } = args.input;

      const srv = placeSimpleBid({ accountId, userId });
      await srv.init({ priceRequestId });
      await srv.placeBid({ items });

      // do not return for now...
      return srv.getUIResponse();
    }
  }
};
