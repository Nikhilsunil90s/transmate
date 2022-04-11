import SecurityChecks from "/imports/utils/security/_security";
import { priceListTemplateSrv } from "../services/priceListTemplate";

export const resolvers = {
  Query: {
    // gets list of price list templates
    async getPriceListTemplates(root, args, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);
      const { options } = args;

      return priceListTemplateSrv({ accountId }).getList({ options });
    }
  }
};
