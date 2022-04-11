import SecurityChecks from "/imports/utils/security/_security.js";
import {
  setStatus,
  mergeStage,
  splitStage,
  updateStage,
  updateStageLocation,
  confirmStage,
  scheduleStage,
  allocateStage
} from "../services/_mutations";

export const resolvers = {
  Mutation: {
    async setStageStatus(root, args, context) {
      try {
        const { accountId, userId } = context;
        const { stageId, status } = args;

        SecurityChecks.checkLoggedIn(userId);

        const srv = setStatus({ userId, accountId });
        await srv.init({ stageId });
        await srv.runChecks();
        await srv.update({ status });
        const res = await srv.fetchData(); // async
        return res;
      } catch (error) {
        console.error({ error });
        throw error;
      }
    },
    async mergeStage(root, args, context) {
      const { accountId, userId } = context;
      const { stageId } = args;

      SecurityChecks.checkLoggedIn(userId);

      const srv = mergeStage({ userId, accountId });
      await srv.init({ stageId });
      await srv.runChecks();
      await srv.merge();
      const res = await srv.fetchData();
      return res;
    },
    async splitStage(root, args, context) {
      try {
        const { accountId, userId } = context;
        const { stageId, location } = args;

        SecurityChecks.checkLoggedIn(userId);
        const srv = splitStage({ userId, accountId });
        await srv.init({ stageId });
        await srv.runChecks();
        await srv.split({ location });
        const res = await srv.fetchData(); // async

        return res;
      } catch (error) {
        console.error({ error });
        throw error;
      }
    },
    async confirmStage(root, args, context) {
      try {
        const { accountId, userId } = context;
        const { stageId, dates } = args.input;

        SecurityChecks.checkLoggedIn(userId);
        const srv = confirmStage({ userId, accountId });
        await srv.init({ stageId });
        await srv.runChecks();
        await srv.confirm({ dates });
        const res = await srv.fetchData();

        return res;
      } catch (error) {
        console.error({ error });
        throw error;
      }
    },
    async scheduleStage(root, args, context) {
      const { accountId, userId } = context;
      const { stageId, loading, unloading } = args.input;

      SecurityChecks.checkLoggedIn(userId);
      const srv = scheduleStage({ userId, accountId });
      await srv.init({ stageId });
      await srv.runChecks();
      await srv.schedule({ loading, unloading });
      const res = await srv.fetchData();

      return res;
    },
    async updateStage(root, args, context) {
      const { accountId, userId } = context;
      const { stageId, updates } = args.input;

      SecurityChecks.checkLoggedIn(userId);
      const srv = updateStage({ userId, accountId });
      await srv.init({ stageId, updates });
      await srv.runChecks();
      await srv.updateStage();
      const res = await srv.getUIResponse();

      return res;
    },
    async updateStageLocation(root, args, context) {
      const { accountId, userId } = context;
      const { stageId, stop, location, overrides } = args.input;

      SecurityChecks.checkLoggedIn(userId);
      const srv = updateStageLocation({ accountId, userId });
      await srv.init({
        stageId,
        stop,
        location,
        overrides
      });
      await srv.runChecks();
      await srv.update();
      return srv.getUIResponse();
    },
    async allocateStage(root, args, context) {
      const { accountId, userId } = context;
      const { stageId, allocation } = args.input;

      SecurityChecks.checkLoggedIn(userId);
      const srv = allocateStage({ accountId, userId });
      await srv.init({ stageId, allocation });
      await srv.runChecks();
      await srv.update();
      return srv.getUIResponse();
    }
  }
};
