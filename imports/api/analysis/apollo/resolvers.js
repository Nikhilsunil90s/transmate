import { Analysis } from "../Analysis";
import { getAnalysis } from "../services/query.getAnalysis";
import { getOverview } from "../services/query.getAnalysesOverview";
import { createAnalysis } from "../services/mutation.createAnalysis";
import SecurityChecks from "/imports/utils/security/_security.js";

const debug = require("debug")("analysis:apollo");

export const resolvers = {
  Query: {
    async getAnalysesOverview(root, args, context) {
      const { accountId, userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { viewKey } = args; // use to generate views, currently not used...
      debug("viewkey", viewKey);

      try {
        const analyses = await getOverview({ accountId, userId }).get({
          query: { accountId }
        });

        return analyses;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async getAnalyses(root, args, context) {
      const { accountId, userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { filters } = args; // use to generate views, currently not used...

      const analyses = await Analysis._collection.aggregate([
        { $match: { accountId, ...filters } },
        { $sort: { "created.at": -1 } },
        { $project: { id: "$_id", name: 1, type: 1, created: 1, status: 1 } }
      ]);

      debug("analysis query result %o", analyses);

      return analyses;
    },
    async getAnalysis(root, args, context) {
      const { accountId, userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { analysisId } = args;

      try {
        const analysis = getAnalysis({ accountId, userId }).get({ analysisId });
        debug("analysis query result %o", analysis);
        return analysis;
      } catch (error) {
        console.error(error);
        throw error;
      }
    }
  },
  Mutation: {
    async createAnalysis(root, args, context) {
      const { accountId, userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { type, name } = args.input;

      try {
        const analysisId = await createAnalysis({ accountId, userId }).create({
          type,
          name
        });
        return analysisId;
      } catch (error) {
        console.error(error);
        throw error;
      }
    }
  }
};
