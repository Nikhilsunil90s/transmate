import SecurityChecks from "/imports/utils/security/_security";
import { ScopeService } from "/imports/api/scope/services/scopeService";
import { rowHeaderFormat } from "/imports/utils/functions/fnScope";

import { ScopeCopyService } from "/imports/api/scope/services/scopeCopyService";
import { ScopeDataService } from "/imports/api/scope/services/scopeDataService";

const debug = require("debug")("apollo:resolvers");

export const resolvers = {
  ScopeDetail: {
    name: scope => scope.name || rowHeaderFormat(scope)
  },
  Query: {
    async getScope(root, args, context) {
      try {
        const { userId } = context;
        const { documentId, type } = args.input || {};

        SecurityChecks.checkLoggedIn(userId);
        const scope = await new ScopeService()
          .setCollections({ type, documentId })
          .scopeDef() // unwind the scope []
          .getDetails(true) // gets details for scope entry
          .add([
            {
              $replaceRoot: {
                newRoot: {
                  $mergeObjects: [
                    "$$ROOT",
                    "$detail",
                    { id: "$detail._id", detail: null }
                  ]
                }
              }
            }
          ])
          .aggregate();

        return scope;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async getScopeShipData(
      root,
      { input: { masterId, masterType, query } },
      { userId }
    ) {
      SecurityChecks.checkLoggedIn(userId);
      debug("scope.shipQueryData called with: %O", {
        masterId,
        masterType,
        query
      });

      // 0. purpose: this method will run an aggregation on the shipment collection based on the query parameters
      //	these parameters are both stored in the scope & in the query parameters:
      //	search form has: [period-from, period-to, carrierId]
      //	scope has: [lanes, volumes, DG, DG class]

      // 1. generate all scope possibilities (use the existing aggregation for that)
      // 2. cycle though them & run a query each time...
      // 3. this data should be summarized & the shipmentIds should be kept in an array....
      // 4. store in details collection

      let res = new ScopeDataService();

      await res.getMasterDoc({
        masterId,
        masterType
      });
      await res.updateMasterDoc({
        update: { "params.query": query, "activity.generateScope": true }
      });

      await res.getScopeItems();

      // await res.getDataFromBQ();
      await res.mapDbData();
      await res.resetDetails();
      await res.saveToDetailsCollection();
      await res.updateMasterDoc({
        update: { "activity.generateScope": false }
      });

      res = res.get("detailsStats");

      return true;
    }
  },
  Mutation: {
    async copyScope(root, args, context) {
      const { userId } = context;

      const { referenceId, referenceType, masterType, masterId } = args.input;
      SecurityChecks.checkLoggedIn(userId);

      // 0. purpose: copy scope from a tender to the new document
      debug("getting scope data from %s %s", referenceType, referenceId);
      try {
        const srv = new ScopeCopyService();
        await srv.getReferenceDoc({ referenceId, referenceType });
        srv.copy();
        await srv.enrichScope();
        srv.checkNewScope();
        await srv.toMasterDoc({ masterType, masterId });
        return srv.get(); // returns the scope & definition
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async scopeDataFromSource(root, args, context) {
      const { userId } = context;
      const { masterId, masterType } = args.input;
      SecurityChecks.checkLoggedIn(userId);

      let res = new ScopeDataService();
      await res.getMasterDoc({
        masterId,
        masterType
      });
      await res.updateMasterDoc({
        update: { "activity.generateScope": true }
      });
      await res.copyDetailItems();
      await res.resetDetails();
      await res.saveToDetailsCollection();
      await res.updateMasterDoc({
        update: { "activity.generateScope": false }
      });
      res = res.get("detailsStats");
      return res;
    },
    async scopeGenerateDataFill(root, args, context) {
      const { userId } = context;
      const { masterId, masterType } = args.input;
      SecurityChecks.checkLoggedIn(userId);
      debug("random data for type:%s, %s", masterType, masterId);
      let res = new ScopeDataService();

      await res.getMasterDoc({
        masterId,
        masterType
      });
      await res.updateMasterDoc({
        update: { "activity.generateScope": true }
      });
      await res.resetDetails();
      await res.getScopeItems();
      await res.dataFill();
      await res.saveToDetailsCollection();
      await res.updateMasterDoc({
        update: { "activity.generateScope": false }
      });
      res = res.get("detailsStats");
      return res;
    }
  }
};
