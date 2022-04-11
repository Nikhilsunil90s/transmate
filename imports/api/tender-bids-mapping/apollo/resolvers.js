/* eslint-disable no-underscore-dangle */
import SecurityChecks from "/imports/utils/security/_security";
import { editTenderBidMapping } from "../services/mutation.editTenderBidMapping";
import { addTenderBidMapping } from "../services/mutation.addTenderBidMapping";
import { removeTenderBidMapping } from "../services/mutation.removeTenderBidMapping";
import { generateTenderBidMapping } from "../services/mutation.generateTenderBidMapping";
import { getTenderBidMappings } from "../services/query.getMappings";
import { generateBiddingSheet } from "../services/mutation.generateBiddingSheet";
import { duplicateTenderBidMappingRow } from "../services/mutation.duplicateTenderBidMappingRow";

const debug = require("debug")("tenderBid:resolver");

export const resolvers = {
  // TenderBidMapping: {
  //   id: parent => parent._id._str
  // },
  Query: {
    async getTenderBidMappings(root, args, context) {
      const { userId, accountId } = context;
      const { tenderBidId } = args;
      debug("call getTenderBidMappings for tenderBidId %o", tenderBidId);
      SecurityChecks.checkLoggedIn(userId);
      return getTenderBidMappings({ accountId, userId })
        .init({ tenderBidId })
        .get();
    }
  },
  Mutation: {
    async addTenderBidMapping(root, args, context) {
      const { userId, accountId } = context;
      const { tenderBidId, mapping } = args.input;

      SecurityChecks.checkLoggedIn(userId);
      debug("addTenderBidMapping for tenderBidId %o", tenderBidId);
      const srv = addTenderBidMapping({ accountId, userId });
      await srv.init({ tenderBidId });
      await srv.addMapping({ mapping });
      return srv.getUIResponse();
    },
    async editTenderBidMapping(root, args, context) {
      const { userId, accountId } = context;
      const { mappingId, ...update } = args.input; // update: {mappingH, mappingV, mappingF}
      debug("editTenderBidMapping for %o", mappingId);
      SecurityChecks.checkLoggedIn(userId);

      const srv = editTenderBidMapping({ accountId, userId });
      await srv.init({ mappingId });
      await srv.update({ update });
      await srv.runPostActions();
      return srv.getUIResponse();
    },
    async duplicateTenderBidMappingRow(root, args, context) {
      const { userId, accountId } = context;
      const { mappingId, topic, originId } = args.input;
      debug("duplicateTenderBidMappingRow for %o", mappingId);
      SecurityChecks.checkLoggedIn(userId);

      const srv = duplicateTenderBidMappingRow({ accountId, userId });
      await srv.init({ mappingId });
      await srv.duplicate({ topic, originId });
      return srv.getUIResponse();
    },
    async removeTenderBidMapping(root, args, context) {
      const { userId, accountId } = context;
      const { mappingId } = args;
      debug("removeTenderBidMapping for %o", mappingId);
      SecurityChecks.checkLoggedIn(userId);

      const srv = removeTenderBidMapping({ accountId, userId });
      await srv.remove({ mappingId });
      return srv.getUIResponse();
    },
    async generateTenderBidMapping(root, args, context) {
      const { userId, accountId } = context;

      SecurityChecks.checkLoggedIn(userId);

      const { mappingId } = args;
      debug("call generateTenderBidMapping for %o", mappingId);
      const srv = generateTenderBidMapping({ userId, accountId });
      await srv.init({ mappingId });
      await srv.generate();
      return srv.getUIResponse();
    },
    async generateTenderBidSheet(root, args, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { tenderBidId } = args;
      debug("call generateTenderBidSheet for tenderBidId %o", tenderBidId);
      const srv = generateBiddingSheet({ accountId, userId });
      await srv.init({ tenderBidId });
      const result = await srv.generate();
      debug("result generateTenderBidSheet %o", result);
      return srv.getUIResponse();
    }
  }
};
