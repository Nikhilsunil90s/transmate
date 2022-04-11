import SecurityChecks from "/imports/utils/security/_security";
import { Cost } from "../Cost";

export const resolvers = {
  Query: {
    async getCost(root, args) {
      return Cost.first(args.costId);
    },
    async getCostTypes(root, args, context) {
      const { userId } = context;
      const { includeDummy } = args;
      SecurityChecks.checkLoggedIn(userId);
      return Cost.where(
        { ...(!includeDummy ? { type: { $ne: "dummy" } } : {}) },
        { sort: { type: 1, group: 1 }, fields: { type: 1, group: 1, cost: 1 } }
      );
    }
  }
};
