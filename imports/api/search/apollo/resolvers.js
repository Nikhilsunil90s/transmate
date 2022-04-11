import SecurityChecks from "/imports/utils/security/_security.js";
import { performSearch } from "../services/queries";
import { partnerSearch } from "/imports/api/search/services/partnerQuery";

const debug = require("debug")("partner:search");

export const resolvers = {
  Query: {
    async search(root, args, context) {
      const { query } = args;
      const { userId, accountId } = context;
      try {
        if (query.trim().length < 3) return [];

        return performSearch({ query }, { userId, accountId });
      } catch (err) {
        const error = new Meteor.Error("error", err.message);
        error.statusCode = 400;
        throw error;
      }
    },
    async searchPartner(root, args, context) {
      const { query } = args;
      const { userId, accountId } = context;

      SecurityChecks.checkLoggedIn(userId);
      try {
        debug("search partner %o", query);
        if (query.trim().length < 2) return [];
        const results = partnerSearch({
          name: query,
          options: { onlyNew: true },
          callerAccountId: accountId
        });

        return results;
      } catch (err) {
        const error = new Meteor.Error("error", err.message);
        error.statusCode = 400;
        throw error;
      }
    }
  }
};
