import SecurityChecks from "/imports/utils/security/_security";
import get from "lodash.get";
import { getTender } from "../services/query.getTender";
import { Tender } from "../Tender";
import { tenderService } from "../services/tender";
import { tenderBidService } from "../services/tenderBid";
import { CheckTenderSecurity } from "/imports/utils/security/checkUserPermissionsForTender.js";
import { tenderOverview } from "../services/query.getTenders";
import {
  createTender,
  updateTender,
  bidFixedPriceList,
  updateAttachment,
  updateBid,
  updateBidderDetail,
  updateTenderStatus,
  generateTenderPackages,
  duplicateTender
} from "../services/_mutations";
import { DEFAULT_VIEW } from "../enums/views";

const debug = require("debug")("apollo:resolvers:tender");

const TENDER_CORE_FIELDS = {
  bidders: 1,
  status: 1,
  contacts: 1,
  accountId: 1,
  customerId: 1
};

export const resolvers = {
  TenderBiddersRequirementResponse: {
    // this needs to receive an object with a type property for it to work, check your connectors!
    __resolveType(bidderResponse, ctx, info) {
      debug(bidderResponse);
      if (
        typeof bidderResponse === "object" &&
        typeof bidderResponse.response === "boolean"
      ) {
        return info.schema.getType("RequirementResponseBool");
      }
      return info.schema.getType("RequirementResponseStr");
    }
  },
  Query: {
    async getTenders(root, args, context) {
      const { accountId, userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { viewKey = DEFAULT_VIEW } = args;
      try {
        return tenderOverview({ accountId, userId }).get({ viewKey });
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async getTender(root, args, context) {
      try {
        const { accountId, userId } = context;
        const { tenderId } = args;

        SecurityChecks.checkLoggedIn(userId);
        const tender = await getTender({ accountId, userId }).get({ tenderId });

        return tender;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async getOwnTenders(root, args, context) {
      try {
        const { accountId, userId } = context;

        SecurityChecks.checkLoggedIn(userId);
        const tenders = Tender.where(
          { accountId },
          { fields: { title: 1, closeDate: 1, created: 1 } }
        );

        return tenders;
      } catch (error) {
        console.error(error);
        throw error;
      }
    }
  },
  Mutation: {
    async createTender(root, args, context) {
      const { userId, accountId } = context;
      const { data } = args;
      SecurityChecks.checkLoggedIn(userId);

      const srv = createTender({ accountId, userId });
      await srv.create({ data });
      return srv.getUIResponse();
    },
    async updateTender(root, args, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);
      const { tenderId, update, reset } = args.input;

      const srv = updateTender({ accountId, userId });
      await srv.init({ tenderId });
      await srv.update({ update, reset });
      return srv.getUIResponse();
    },
    async setBidderTimeStamp(root, { tenderId }, context) {
      const { userId, accountId } = context;
      try {
        SecurityChecks.checkLoggedIn(userId);
        const tender = await Tender.first({ _id: tenderId });
        SecurityChecks.checkIfExists(tender);

        const srv = tenderBidService({ accountId, userId });
        srv.init({ tender });
        srv.check();
        const tenderRes = await srv.setTimeStamps();

        return tenderRes ? tenderRes._id : null;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async saveTenderDetails(root, { input = [] }, context) {
      const { userId, accountId } = context;

      try {
        SecurityChecks.checkLoggedIn(userId);
        const tender = await Tender.first(
          { _id: get(input, "[0].item.tenderId") },
          { fields: { _id: 1 } }
        );
        SecurityChecks.checkIfExists(tender);

        const res = await tenderService({ accountId, userId })
          .init({ tender })
          .saveDetails({ updates: input });

        return res._id;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async saveBidders(root, { input = {} }, context) {
      const { userId, accountId } = context;
      const { tenderId, partnerIds } = input;
      try {
        SecurityChecks.checkLoggedIn(userId);
        const tender = Tender.first(
          { _id: tenderId },
          { fields: TENDER_CORE_FIELDS }
        );
        SecurityChecks.checkIfExists(tender);

        const check = new CheckTenderSecurity(
          { tender },
          { accountId, userId }
        );
        await check.getUserRoles();
        check.init();
        check.can({ action: "editPartners" }).throw();

        const { success, errors } = await tenderService({ accountId, userId })
          .init({ tender })
          .addRemoveBidders({
            partnerIds
          });
        debug({ success, errors });
        return { success, errors };
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async tenderUpdateBidderDetail(root, args, context) {
      const { userId, accountId } = context;
      const { tenderId, partnerId, topic, update } = args.input;

      SecurityChecks.checkLoggedIn(userId);
      const srv = updateBidderDetail({ accountId, userId });
      await srv.init({ tenderId });
      await srv.updateBidder({ partnerId, topic, update });
    },
    async tenderUpdateBid(root, args, context) {
      const { userId, accountId } = context;
      const { tenderId, topic, update } = args.input;

      SecurityChecks.checkLoggedIn(userId);
      const srv = updateBid({ accountId, userId });
      await srv.init({ tenderId });
      await srv.updateBid({ topic, update });
      return srv.getUIResponse();
    },
    async tenderBidFixedPriceList(root, args, context) {
      const { userId, accountId } = context;
      const { tenderId } = args;

      try {
        SecurityChecks.checkLoggedIn(userId);
        const srv = bidFixedPriceList({
          accountId,
          userId
        });
        await srv.generateBid({ tenderId });
        return srv.getUIResponse();
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async addAttachmentTender(root, args, context) {
      const { accountId, userId } = context;
      const { tenderId, attachment } = args.input;

      try {
        SecurityChecks.checkLoggedIn(userId);
        const srv = await updateAttachment({ accountId, userId }).init({
          tenderId
        });
        srv.runChecks();
        await srv.add({ attachment });
        const res = await srv.getUIResponse();
        return res;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async removeAttachmentTender(root, args, context) {
      const { accountId, userId } = context;
      const { tenderId, id } = args.input;

      try {
        SecurityChecks.checkLoggedIn(userId);
        const srv = await updateAttachment({ accountId, userId }).init({
          tenderId
        });
        srv.runChecks();
        await srv.remove({ documentId: id });
        const res = await srv.getUIResponse();
        return res;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async updateTenderStatus(root, args, context) {
      const { userId } = context;
      const { tenderId, action } = args.input;

      SecurityChecks.checkLoggedIn(userId);
      const srv = updateTenderStatus(context);
      await srv.init({ tenderId });
      await srv.updateStatus({ action });
      return srv.getUIResponse();
    },
    async generateTenderPackages(root, args, context) {
      const { userId } = context;
      const { tenderId } = args;

      SecurityChecks.checkLoggedIn(userId);
      const srv = generateTenderPackages(context);
      await srv.init({ tenderId });
      await srv.generate();
      return srv.getUIResponse();
    },
    async duplicateTender(root, args, context) {
      const { userId } = context;
      const { tenderId, keepData } = args.input;

      SecurityChecks.checkLoggedIn(userId);

      const srv = duplicateTender(context);
      await srv.init({ tenderId });
      await srv.copy({ keepData });
      return srv.getUIResponse();
    }
  }
};
