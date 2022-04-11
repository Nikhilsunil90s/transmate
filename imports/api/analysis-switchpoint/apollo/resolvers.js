import { generateLanes } from "../services/mutation.generateLanes";
import { updateSwitchPoint } from "../services/mutation.updateSwitchpoint";
import SecurityChecks from "/imports/utils/security/_security";

const debug = require("debug")("analysis:switchpoint:resolver");

export const resolvers = {
  Mutation: {
    async switchPointGenerateLanes(root, args, context) {
      const { userId } = context;
      SecurityChecks.checkLoggedIn(userId);
      const { analysisId, priceListId } = args.input;

      const srv = generateLanes(context);
      await srv.init({ analysisId });
      await srv.generate({ priceListId });
      return srv.getUIResponse();
    },
    async updateSwitchPoint(root, args, context) {
      const { userId } = context;
      SecurityChecks.checkLoggedIn(userId);
      const { analysisId, update } = args.input;

      const srv = updateSwitchPoint(context);
      await srv.init({ analysisId });
      await srv.update({ update });
      return srv.getUIResponse();
    },
    async processSwitchPoint(root, args, context) {
      const { userId } = context;
      SecurityChecks.checkLoggedIn(userId);
      const { analysisId } = args;

      debug({ analysisId });

      // call the remote function
      // TODO [#136]: jan -> can you help out here?
    }
  }
};
