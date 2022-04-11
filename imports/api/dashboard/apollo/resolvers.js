import SecurityChecks from "/imports/utils/security/_security.js";
import { getDashboardData } from "../services/query.getDashboardData";

export const resolvers = {
  Query: {
    async getDashboardData(root, args, context) {
      const { accountId, userId } = context;
      SecurityChecks.checkLoggedIn(userId);
      if (!accountId) throw Error("accountId missing");
      return getDashboardData({ accountId, userId }).get(); // async
    }
  }
};
