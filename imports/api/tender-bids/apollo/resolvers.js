import SecurityChecks from "/imports/utils/security/_security";
import { TenderBid } from "../TenderBid";
import { TenderBidService } from "../services/tenderBidService";
import { createTenderBid } from "../services/mutation.createTenderBid";
import { updateTenderBid } from "../services/mutation.updateTenderBid";
import { autoSelectPriceLists } from "../services/mutation.autoSelectPricelists";
import { tenderBidOverview } from "../services/query.getTenderBidOverview";
import { DEFAULT_VIEW } from "../enums/views";

const debug = require("debug")("tenderBid:resolvers");

export const resolvers = {
  Query: {
    async getTenderBidOverview(root, args, context) {
      const { accountId, userId } = context;
      debug("getTenderBidOverview %o", accountId);
      SecurityChecks.checkLoggedIn(userId);

      const { viewKey = DEFAULT_VIEW } = args;
      try {
        return tenderBidOverview({ accountId, userId }).get({ viewKey });
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async getTenderBid(root, args, context) {
      const { accountId, userId } = context;
      SecurityChecks.checkLoggedIn(userId);
      const { tenderBidId } = args;
      return TenderBid.first({ _id: tenderBidId, accountId });
    }
  },
  Mutation: {
    async createTenderBid(root, args, context) {
      const { accountId, userId } = context;
      SecurityChecks.checkLoggedIn(userId);
      const srv = createTenderBid({ accountId, userId });
      await srv.create();
      return srv.getUIResponse();
    },
    async updateTenderBid(root, args, context) {
      const { accountId, userId } = context;
      const { tenderBidId, updates } = args.input;
      SecurityChecks.checkLoggedIn(userId);

      const srv = updateTenderBid({ accountId, userId });
      await srv.init({ tenderBidId });
      await srv.runChecks();
      await srv.update({ updates });
      return srv.getUIResponse();
    },
    async tenderBidGenerateOfferSheet(root, args, context) {
      const { accountId, userId } = context;
      const { tenderBidId } = args;

      SecurityChecks.checkLoggedIn(userId);
      const srv = new TenderBidService({ accountId, userId });
      await srv.fetchTenderBidDoc({ tenderBidId });
      await srv.fetchTenderBidMapping();
      await srv.generateOffer();
      return srv.getUIResponse({ fields: { offer: 1 } });
    },
    async tenderBidSelectPartner(root, args, context) {
      const { accountId, userId } = context;
      const { tenderBidId, partnerId, name } = args.input;

      SecurityChecks.checkLoggedIn(userId);

      const srv = new TenderBidService({ accountId, userId });
      await srv.fetchTenderBidDoc({ tenderBidId });
      await srv.runChecks({ action: "changePartner" });
      await srv.selectPartner({ partnerId, name });
      return srv.getUIResponse({ fields: { partners: 1 } });
    },
    async tenderBidRemoveDocument(root, args, context) {
      const { accountId, userId } = context;
      const { tenderBidId, documentId } = args.input;

      SecurityChecks.checkLoggedIn(userId);

      const srv = new TenderBidService({
        accountId,
        userId
      });
      await srv.fetchTenderBidDoc({ tenderBidId });
      await srv.removeDocument({ documentId });
      return srv.getUIResponse({ fields: { "source.documents": 1 } }); // should return source.documents
    },
    async tenderBidAddDocument(root, args, context) {
      const { accountId, userId } = context;
      const { tenderBidId, document } = args.input;

      SecurityChecks.checkLoggedIn(userId);
      const srv = new TenderBidService({
        accountId,
        userId
      });
      await srv.fetchTenderBidDoc({ tenderBidId });
      await srv.addDocument(document);
      return srv.getUIResponse({ fields: { "source.documents": 1 } }); // should return source.documents
    },
    async tenderBidAutoSelectPricelists(root, args, context) {
      const { accountId, userId } = context;
      const { tenderBidId } = args;

      SecurityChecks.checkLoggedIn(userId);
      const srv = autoSelectPriceLists({
        accountId,
        userId
      });
      await srv.init({ tenderBidId });
      await srv.select();
      return srv.getUIResponse();
    }
  }
};
