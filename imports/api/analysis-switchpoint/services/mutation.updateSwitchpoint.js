import get from "lodash.get";
import { AnalysisSwitchPoint } from "/imports/api/analysis-switchpoint/AnalysisSwitchPoint";
import { Analysis } from "/imports/api/analysis/Analysis";
import SecurityChecks from "/imports/utils/security/_security";

export const updateSwitchPoint = ({ accountId, userId }) => ({
  accountId,
  userId,
  async init({ analysisId }) {
    this.analysisId = analysisId;
    this.switchPoint = await AnalysisSwitchPoint.first({
      analysisId
    });
    SecurityChecks.checkIfExists(this.switchPoint);
    return this;
  },
  async update({ update }) {
    const { name } = update;
    if (name) {
      await Analysis._collection.update(
        { _id: this.analysisId },
        { $set: { name } }
      );
    }
    if (
      get(update, ["params", "uom"]) &&
      get(update, ["params", "uom"]) !==
        get(this.switchPoint, ["params", "uom"])
    ) {
      // reset the calculation as the uom has changed
      await AnalysisSwitchPoint._collection.update(
        { analysisId: this.analysisId },
        {
          $unset: {
            "lanes.$[].calculations": 1,
            "lanes.$[].switchPointCount": 1,
            "lanes.$[].switchPoints": 1
          }
        }
      );
    }
    await this.switchPoint.update_async(update);
    return this;
  },
  getUIResponse() {
    return this.switchPoint.reload();
  }
});
