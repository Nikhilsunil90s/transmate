import { Mongo } from "meteor/mongo";
import Model from "../Model";

import { Analysis } from "/imports/api/analysis/Analysis";
import { AnalysisSwitchPointSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/analysis-switch-point";

class AnalysisSwitchPoint extends Model {
  // eslint-disable-next-line camelcase
  static before_create(obj) {
    const defaults = AnalysisSwitchPointSchema.clean({});
    Object.assign(obj, defaults);
    return obj;
  }

  // FIXME: DEPRECATED??
  // matchingPriceListsQuery(accountId = AllAccounts.id()) {
  //   const laneQueries = [];
  //   _.each(this.lanes, lane => {
  //     return laneQueries.push({
  //       $and: [
  //         PriceList.locationQuery("from", lane.pickup),
  //         {
  //           "lanes.to.zones": {
  //             $elemMatch: {
  //               "0": lane.delivery.countryCode
  //             }
  //           }
  //         }
  //       ]
  //     });
  //   });

  //   // Todo: centralize
  //   const accessRules = {
  //     deleted: false,
  //     $or: [
  //       {
  //         creatorId: accountId,
  //         status: {
  //           $in: ["draft", "for-approval", "active", "inactive"]
  //         }
  //       },
  //       {
  //         customerId: accountId,
  //         status: {
  //           $in: ["for-approval", "active", "inactive"]
  //         }
  //       },
  //       {
  //         carrierId: accountId,
  //         status: {
  //           $in: ["for-approval", "active", "inactive"]
  //         }
  //       }
  //     ]
  //   };
  //   if (laneQueries.length) {
  //     return {
  //       $and: [
  //         accessRules,
  //         {
  //           $or: laneQueries
  //         }
  //       ]
  //     };
  //   }
  //   return accessRules;
  // }

  analysis() {
    return Analysis.first(this.analysisId);
  }
}

AnalysisSwitchPoint._collection = new Mongo.Collection("analysis.switchPoint");

AnalysisSwitchPoint._collection.attachSchema(AnalysisSwitchPointSchema);
AnalysisSwitchPoint._collection = AnalysisSwitchPoint.updateByAt(
  AnalysisSwitchPoint._collection
);

export { AnalysisSwitchPoint };
