import { startSimulation } from "../services/mutation.startSimulation";
import { saveDetail } from "../services/mutation.saveDetail";
import { saveSimulation } from "../services/mutation.saveSimulation";
import SecurityChecks from "/imports/utils/security/_security.js";

const debug = require("debug")("apollo:resolvers:simulation");

export const resolvers = {
  Mutation: {
    async simulationStart(root, args, context) {
      const { accountId, userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { analysisId } = args;

      try {
        // TODO [#160]: [simulation]access control
        const res = await startSimulation({ accountId, userId }).start({
          analysisId
        });
        return res;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async simulationSaveDetail(root, args, context) {
      const { accountId, userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { analysisId, updates } = args; // updates: [{rowData, update}]

      try {
        // TODO [#160]: [simulation]access control
        const srv = saveDetail({ accountId, userId }).init({ analysisId });

        const res = await srv.update({ updates });
        return res;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async simulationSaveUpdate(root, args, context) {
      const { accountId, userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { analysisId, update } = args.input;

      try {
        debug(update);
        const res = saveSimulation({ accountId, userId })
          .init({ analysisId })
          .update({ update });
        return res;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async simulationNextStep(root, args, context) {
      const { accountId, userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { analysisId, nextStep } = args;

      const srv = saveSimulation({ accountId, userId });
      await srv.init({ analysisId });
      await srv.nextStep({ nextStep });
      return analysisId;
    },
    async simulationSavePriceLists(root, args, context) {
      const { accountId, userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { analysisId, priceLists } = args.input;

      const srv = saveSimulation({ accountId, userId });
      await srv.init({ analysisId, fields: { priceLists: 1 } });
      return srv.updatePriceLists({ priceLists });
    }
  }
};
