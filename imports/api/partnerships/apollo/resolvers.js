import SecurityChecks from "/imports/utils/security/_security.js";
import { partnerView } from "../services/query.getPartnersView";

export const resolvers = {
  Query: {
    async getPartnersView(root, args, context) {
      const { accountId, userId } = context;
      const { viewKey, filters } = args.input;

      SecurityChecks.checkLoggedIn(userId);

      return partnerView({ accountId, userId: this.userId }).get({
        viewKey,
        filters
      });
    }
  }
};
