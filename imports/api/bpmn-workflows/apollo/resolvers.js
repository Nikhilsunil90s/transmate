import SecurityChecks from "/imports/utils/security/_security";

import { getWorkflows } from "../services/query.getWorkflows";
import { deleteWorkflow } from "../services/mutation.deleteWorkflow";
import { createWorkflow } from "../services/mutation.createWorkflow";

export const resolvers = {
  Query: {
    async getWorkflows(root, args, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { query } = args.input;

      return getWorkflows({ accountId, userId }).get({ query });
    }
  },
  Mutation: {
    async deleteWorkflow(root, args, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { workflowId } = args;
      const srv = deleteWorkflow({ accountId, userId });
      await srv.init({ workflowId });
      await srv.runChecks();
      await srv.delete();
      return srv.getUIResponse();
    },
    async createWorkFlow(root, args, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const {
        references,
        workflow,
        data,
        accountId: referencedAccountId
      } = args.input;
      await createWorkflow({ accountId, userId }).create({
        references,
        workflow,
        data,
        accountId: referencedAccountId
      });
      return true;
    }
  }
};
