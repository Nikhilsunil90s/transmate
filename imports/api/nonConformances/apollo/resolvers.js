import SecurityChecks from "/imports/utils/security/_security";
import { NonConformance } from "../NonConformance";

import { addNonConformance } from "../services/addNonConformance";
import { updateNonConformance } from "../services/updateNonConformance";
import { removeNonConformance } from "../services/removeNonConformance";

export const resolvers = {
  Query: {
    async getNonConformances(root, args, context) {
      const { userId } = context;
      SecurityChecks.checkLoggedIn(userId);
      const { shipmentId } = args;
      try {
        const data = await NonConformance.where({ shipmentId });

        return [...data];
      } catch (error) {
        console.error(error);
        throw error;
      }
    }
  },
  Mutation: {
    async addNonConformance(root, args, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { shipmentId, data } = args;
      const srv = addNonConformance({ accountId, userId });
      await srv.add({ shipmentId, data });
      return srv.getUIResponse();
    },
    async updateNonConformance(root, args, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);
      const { id, update } = args;

      const srv = updateNonConformance({ accountId, userId });
      await srv.update({ id, update });
      return srv.getUIResponse();
    },
    async deleteNonConformance(root, args, context) {
      const { accountId, userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { id } = args;
      const srv = removeNonConformance({ accountId, userId });
      await srv.remove({ id });
      return srv.getUIResponse();
    }
  }
};
