import dot from "dot-object";
import { AnalysisSimulationV2 } from "../AnalysisSimulationV2";
import { AnalysisSimulationV2Detail } from "../AnalysisSimulationV2-detail";
import SecurityChecks from "/imports/utils/security/_security";
import { stepManager } from "./stepsManager";

const debug = require("debug")("analysis:updateDetail");

export const saveDetail = ({ accountId, userId }) => ({
  accountId,
  userId,
  init({ analysisId }) {
    this.analysisId = analysisId;
    this.simulation = AnalysisSimulationV2.first({
      analysisId: this.analysisId
    });
    SecurityChecks.checkIfExists(this.simulation);
    return this;
  },
  async update({ updates }) {
    const bulkOp = AnalysisSimulationV2Detail._collection
      .rawCollection()
      .initializeOrderedBulkOp();

    updates.forEach(({ rowData: item, update }) => {
      const updateDot = dot.object(update);
      const quantity = {
        ...(item.quantity != null ? item.quantity : undefined),
        ...updateDot.quantity
      };
      const name = item.name || updateDot.name;

      bulkOp
        .find({
          analysisId: this.analysisId,
          accountId: this.accountId,
          laneId: item.laneId,
          volumeGroupId: item.volumeGroupId,
          volumeRangeId: item.volumeRangeId,
          goodsDG: item.goodsDG,

          // goodsDGClass: r.goodsDGClass
          equipmentId: item.equipmentId
        })
        .upsert()
        .updateOne({
          $set: {
            quantity,
            name,
            shipmentIds: update.shipmentIds
          }
        });
    });

    try {
      const { result } = await bulkOp.execute();

      if (!this.simulation.steps.includes("start")) {
        stepManager({ docId: this.analysisId });
      }

      debug({ result });
      const { nModified } = result || {};
      return nModified;
    } catch (err) {
      console.error("error during bulkOp...", err);
      throw err;
    }
  }
});
