import get from "lodash.get";
import SecurityChecks from "/imports/utils/security/_security.js";
import { PriceList } from "../PriceList";

import {
  createPriceList,
  createPriceListFromFile,
  duplicatePriceList,
  updatePriceList,
  updateAttachment,
  setPriceListStatus,
  leadTimesCopyLanes,
  priceListRateUpdate,
  updatePriceListConversions,
  priceListCopyAdditionalRates,
  updateFuelIndex,
  priceListCopyConversionsAndDefinitions,
  paramPriceLookup // a query as mutation as we are recording some params
} from "../services/_mutations";

import { getPriceList } from "../services/query.getPriceList";
import { getRates } from "../services/query.getRates";
import { callCloudFunction } from "/imports/utils/server/ibmFunctions/callFunction";

import { priceListGridUpdate } from "../services/priceListGridUpdate";
import { priceListView } from "../services/priceListView";

const debug = require("debug")("price-list:resolver");

export const resolvers = {
  PriceList: {
    expired: priceList => {
      return PriceList.init(priceList).isExpired();
    }
  },
  PriceListRate: {
    id: rate => get(rate, ["_id", "_str"])
  },
  PriceLookupItem: {
    id: parent => parent._id,
    priceRequestId: parent => (parent.priceRequest || {}).id,
    biddingNotes: parent => parent.biddingNotes || parent.priceRequest?.notes
  },
  Query: {
    async getOwnPriceLists(root, args, context) {
      const { accountId, userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { ...query } = args.input;
      const priceLists = await PriceList._collection.aggregate([
        {
          $match: {
            creatorId: accountId,
            ...query
          }
        },
        { $sort: { "created.at": -1 } },
        {
          $project: {
            id: "$_id",
            carrierName: 1,
            carrierId: 1,
            title: 1,
            status: 1,
            type: 1
          }
        }
      ]);
      return priceLists;
    },
    async getPriceList(root, args, context) {
      const { accountId, userId } = context;
      const { priceListId } = args;
      try {
        SecurityChecks.checkLoggedIn(userId);
        const priceList = await getPriceList({ accountId, userId }).get({
          priceListId
        });

        return priceList;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async getPriceListRates(root, args, context) {
      const { accountId, userId } = context;
      const { priceListId, query, inGrid } = args;

      SecurityChecks.checkLoggedIn(userId);
      const priceListRates = await getRates({ accountId, userId }).get({
        priceListId,
        query,
        inGrid
      });

      debug("priceListRates %o", (priceListRates || []).length);

      return priceListRates;
    },
    async getPriceLookupShipment(root, args, context) {
      const { userId } = context;
      const { shipmentId, options } = args.input;
      debug("getPriceLookupShipment from id :%o", shipmentId);

      // fitler off query args that are null
      try {
        SecurityChecks.checkLoggedIn(userId);
        const result = await callCloudFunction(
          "runShipPriceLookup",
          {
            shipmentId,
            options,
            debugDetails: false
          },
          context
        );

        debug("calculation received", result);

        return result;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async getPriceViewList(
      root,
      { input: { viewKey, filters } },
      { accountId, userId }
    ) {
      SecurityChecks.checkLoggedIn(userId);
      return priceListView({ accountId, userId }).get({
        viewKey,
        filters
      });
    }
  },
  Mutation: {
    async createPriceList(root, args, context) {
      const { accountId, userId } = context;
      const { ...data } = args.input || {};

      SecurityChecks.checkLoggedIn(userId);
      const srv = createPriceList({ accountId, userId });
      await srv.create({ data });
      srv.setNotification();
      return srv.get(); // return priceList Document
    },
    async updatePriceList(root, args, context) {
      const { accountId, userId } = context;
      const { priceListId, updates } = args.input;

      try {
        SecurityChecks.checkLoggedIn(userId);
        const srv = updatePriceList({ accountId, userId });
        await srv.init({ priceListId, updates });
        await srv.runChecks();
        await srv.update();

        return srv.getUIresponse();
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async updatePriceListConversions(root, args, context) {
      const { accountId, userId } = context;
      const { priceListId, conversions } = args.input;

      try {
        SecurityChecks.checkLoggedIn(userId);
        const srv = updatePriceListConversions({ accountId, userId });
        await srv.init({ priceListId });
        await srv.runChecks();
        await srv.updateConversions({ conversions });

        return srv.getUIresponse();
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async duplicatePriceList(root, args, context) {
      const { accountId, userId } = context;
      const { priceListId, rates, overrides } = args.input;
      SecurityChecks.checkLoggedIn(userId);

      const srv = duplicatePriceList({ accountId, userId });
      await srv.init({ priceListId });
      await srv.runChecks();
      await srv.duplicate({ rates, overrides });
      const res = srv.getUIResponse(); // id of newly created item
      return res;
    },
    async removeAttachment(root, args, context) {
      const { accountId, userId } = context;
      const { priceListId, index } = args.input;

      try {
        SecurityChecks.checkLoggedIn(userId);
        const updateAttachementService = await updateAttachment({
          accountId,
          userId
        }).init({
          priceListId
        });
        await updateAttachementService.runChecks();
        const attachments = await updateAttachementService.remove({ index });
        return attachments;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async addAttachment(root, args, context) {
      const { accountId, userId } = context;
      const { priceListId, attachment } = args.input;

      try {
        SecurityChecks.checkLoggedIn(userId);
        const srv = await updateAttachment({ accountId, userId }).init({
          priceListId
        });
        await srv.runChecks();
        const attachments = await srv.add({ attachment });
        return attachments;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async setPriceListStatus(root, args, context) {
      const { accountId, userId } = context;
      const { priceListId, action } = args.input;

      try {
        SecurityChecks.checkLoggedIn(userId);
        const srv = await setPriceListStatus({ accountId, userId }).init({
          priceListId
        });
        await srv.setStatus({ action });
        const res = await srv.getUIresponse();
        return res;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async priceListLeadTimesCopyLanes(root, args, context) {
      const { accountId, userId } = context;
      const { priceListId } = args;

      try {
        SecurityChecks.checkLoggedIn(userId);
        const srv = leadTimesCopyLanes({ accountId, userId });
        await srv.init({ priceListId });
        await srv.copyLanes();
        return srv.getUIresponse();
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async createPriceListFromUpload(root, args, context) {
      const { accountId, userId } = context;
      const { xlsUrl, partnerId } = args;
      try {
        SecurityChecks.checkLoggedIn(userId);
        const srv = createPriceListFromFile({ accountId, userId });
        await srv.create({ partnerId, xlsUrl });
        await srv.setNotification().generateData();
        const priceList = srv.get();
        debug(
          "return createPriceListFromUpload: %o",
          get(priceList, "_id", "no id returned!")
        );
        return priceList;
      } catch (err) {
        console.error(err);
        throw err;
      }
    },
    async updatePriceListRatesGrid(root, args, context) {
      const { accountId, userId } = context;
      const { priceListId, updates } = args;
      try {
        SecurityChecks.checkLoggedIn(userId);

        const srv = priceListGridUpdate({
          accountId,
          priceListId
        });
        await srv.runChecks();
        srv.prioritizeUpdates({ updates });
        await srv.runCellUpdates();
        await srv.runHeaderUpdates();
        await srv.runTemplateStructureUpdates();
        const { results, errors } = srv.getResults();
        debug("mass update %o", { results, errors });

        return { results, errors };
      } catch (err) {
        console.error(err);
        throw err;
      }
    },
    async updatePriceListRate(root, args, context) {
      const { accountId, userId } = context;
      const { priceListId, id, update } = args.input;

      SecurityChecks.checkLoggedIn(userId);
      const srv = priceListRateUpdate({ accountId, userId });
      await srv.init({ priceListId });
      await srv.upsert({ id, update });
      return srv.getUIResponse();
    },
    async copyPriceListAdditionalRates(root, args, context) {
      const { accountId, userId } = context;
      const { priceListId, sourcePriceListId } = args.input;

      SecurityChecks.checkLoggedIn(userId);
      const srv = priceListCopyAdditionalRates({ accountId, userId });
      await srv.init({ priceListId });
      await srv.copy({ sourcePriceListId });
      return srv.getUIResponse();
    },
    async copyPriceListConversions(root, args, context) {
      const { accountId, userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { priceListId, sourcePriceListId } = args.input;

      const srv = priceListCopyConversionsAndDefinitions({ accountId, userId });
      await srv.init({ priceListId });
      await srv.copy({ sourcePriceListId });
      return srv.getUIResponse();
    },
    async getManualPriceLookupResult(root, args, context) {
      const { accountId, userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { params, options } = args.input;

      const srv = paramPriceLookup({ accountId, userId }).init({
        params,
        options
      });
      await srv.getLocationData();
      srv.convertToAPIParams();
      const res = await srv.get();
      return res;
    },
    async updatePriceListFuelIndex(
      root,
      { fuelIndexId, priceListId },
      context
    ) {
      const { accountId, userId } = context;

      SecurityChecks.checkLoggedIn(userId);

      const srv = updateFuelIndex({ accountId, userId });
      await srv.init({ priceListId });
      srv.runChecks();
      await srv.update({ fuelIndexId });
      return srv.getUIResponse();
    }
  }
};
