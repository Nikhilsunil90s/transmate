import { JobManager } from "../../../utils/server/job-manager.js";
import { Analysis } from "../Analysis";
import { AnalysisSimulationV2 } from "../../analysis-simulation/AnalysisSimulationV2";
import { AnalysisSwitchPoint } from "/imports/api/analysis-switchpoint/AnalysisSwitchPoint";

export const createAnalysis = ({ accountId, userId }) => ({
  accountId,
  userId,
  async create({ type, name }) {
    const analysis = await Analysis.create_async({
      type,
      name,
      accountId: this.accountId
    });

    const analysisId = analysis._id;
    JobManager.post("analysis.created", {
      userId: this.userId,
      accountId: this.accountId,
      analysisId,
      type
    });

    if (!analysisId) throw new Meteor.Error("Could not create analysis");

    if (type === "switchPoint") {
      await AnalysisSwitchPoint.create_async({
        analysisId,
        accountId: this.accountId,
        name
      });
    }
    if (type === "simulation") {
      await AnalysisSimulationV2.create_async({
        analysisId,
        accountId: this.accountId,
        name,
        steps: ["options"]
      });
    }

    return analysisId;
  }
});
