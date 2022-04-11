import { taskOverview } from "../services/taskOverview";
import SecurityChecks from "/imports/utils/security/_security";
import { updateTask } from "../services/mutation.updateTask";

export const resolvers = {
  Query: {
    async getMyTasks(root, args, context) {
      const { accountId, userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { filters } = args;

      const srv = taskOverview({ accountId, userId });
      await srv.getData({
        filters: { ...filters, finished: false }
      });
      await srv.addReferenceStatus({ filtered: false });
      srv.toList();
      return srv.get();
    },
    async getTaskOverView(root, { filters }, { accountId, userId }) {
      SecurityChecks.checkLoggedIn(userId);

      const srv = taskOverview({ userId, accountId });
      await srv.getData({ userId, filters });
      srv.toList();
      return srv.get();
    }
  },
  Mutation: {
    async updateTask(
      root,
      { input: { taskId, update, options = {} } },
      { userId, accountId }
    ) {
      SecurityChecks.checkLoggedIn(userId);

      return updateTask({ taskId, accountId, update, options });
    }
  }
};
