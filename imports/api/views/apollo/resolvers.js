import { ShipmentsView } from "/imports/api/views/ShipmentsView";
import { getPagedShipmentOverview } from "../services/query.getPagedShipmentOverview";
import { upsertShipmentView } from "../services/mutation.upsertShipmentView";
import { removeShipmentView } from "../services/mutation.removeShipmentView";
import SecurityChecks from "../../../utils/security/_security";

const debug = require("debug")("resolvers:shipmentView");

export const resolvers = {
  Query: {
    async getShipmentViews(root, args, context) {
      try {
        const { accountId, userId } = context;
        SecurityChecks.checkLoggedIn(userId);
        return ShipmentsView.where(
          {
            $or: [
              { accountId, "created.by": userId },
              { accountId, isShared: true },
              { type: "global" }
            ]
          },
          {
            fields: {
              name: 1,
              type: 1,
              "created.by": 1,
              accountId: 1,
              isShared: 1
            }
          }
        );
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async getShipmentView(root, args, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);
      try {
        let options;
        const { viewId, full } = args;

        // Full is only used for editing the filter; for normal display we only need
        // the fields below
        if (!full) {
          options = {
            fields: {
              name: 1,
              columns: 1,
              filters: 1,
              accountId: 1,
              type: 1,
              created: 1,
              order: 1,
              isShared: 1,
              shipmentOverViewType: 1
            }
          };
        }
        const res = await ShipmentsView.first(
          {
            $and: [
              { _id: viewId },
              { $or: [{ accountId }, { type: "global" }] }
            ]
          },
          options
        );

        return res;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async getPagedShipmentOverview(root, args, context) {
      const { accountId, userId } = context;
      const { viewId, jobId, start, length, sort, filters } = args.input;

      debug("paged shipment overview %o", args.input);
      SecurityChecks.checkLoggedIn(userId);

      try {
        const res = await getPagedShipmentOverview({ accountId, userId }).get({
          viewId,
          jobId,
          start: start || 0,
          length: length || 10,
          sort: sort || { column: "dates.created", dir: "desc" },
          filters
        });
        debug("view result", res);
        return res;
      } catch (e) {
        console.error({ e });
        return { data: [] };
      }
    }
  },
  Mutation: {
    async upsertShipmentView(root, args, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { viewId, asNew, data } = args.input;

      const srv = upsertShipmentView({ accountId, userId });
      await srv.upsert({ viewId, asNew, data });
      await srv.saveToViewPreferences();
      return srv.getUIResponse();
    },
    async removeShipmentView(root, args, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { viewId } = args;
      const srv = removeShipmentView({ userId, accountId });
      await srv.init({ viewId });
      srv.remove();
      await srv.saveToViewPreferences();

      return true;
    }
  }
};
