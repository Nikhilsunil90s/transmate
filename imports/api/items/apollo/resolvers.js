import SecurityChecks from "/imports/utils/security/_security.js";
import { ShipmentItem } from "/imports/api/items/ShipmentItem";

import { saveShipmentItem } from "../services/mutation.saveShipmentItem";
import { deleteShipmentItem } from "../services/mutation.deleteShipmentItem";
import { splitShipmentItem } from "../services/mutation.splitShipmentItem";
import { changeParentNode } from "../services/mutation.changeParentNode";

export const resolvers = {
  Query: {
    async getShipmentItems(root, args) {
      const { shipmentId, level } = args.input;
      const items = await ShipmentItem.where({
        shipmentId,
        ...(level ? { level: { $lte: level } } : undefined)
      });
      return items;
    }
  },

  Mutation: {
    async saveShipmentItem(_, { input }, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);

      try {
        const { id, shipmentId, ...update } = input;
        const srv = saveShipmentItem({ accountId, userId });
        await srv.runChecks({ shipmentId });
        await srv.upsert({ id, update });
        return srv.getUIResonse();
      } catch (error) {
        console.error({ error });
        throw error;
      }
    },
    async changeShipmentItemParentNode(_, { input }, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { shipmentId, id, targetParentItemId } = input;

      const srv = changeParentNode({ accountId, userId });
      srv.runChecks({ shipmentId });
      await srv.changeNode({ id, targetParentItemId });
      return srv.getUIResponse();
    },
    async deleteShipmentItem(_, { input }, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { id } = input;
      const srv = deleteShipmentItem({ accountId, userId });
      await srv.runChecks({ id });
      await srv.delete();

      return srv.getUIResponse();
    },
    async splitShipmentItem(_, { input }, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { shipmentItemId, amount } = input;
      const srv = splitShipmentItem({ accountId, userId });
      await srv.init({ shipmentItemId, amount });
      await srv.split();

      return srv.getUIResponse();
    }
  }
};
