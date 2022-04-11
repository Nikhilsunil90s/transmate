import SecurityChecks from "/imports/utils/security/_security";
import { addReview } from "../services/mutation.addPartnerReview";

export const resolvers = {
  Mutation: {
    async addPartnerReview(root, args, context) {
      const { userId, accountId } = context;
      const { partnerId, scoring } = args;
      try {
        SecurityChecks.checkLoggedIn(userId);
        const res = await addReview({ accountId, userId }).add({
          partnerId,
          scoring
        });
        return res;
      } catch (error) {
        console.error(error);
        throw error;
      }
    }
  }
};
