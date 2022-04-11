import { AnalysisSimulationV2 } from "../AnalysisSimulationV2";
import { SimulationService } from "./simulationService";

export const startSimulation = ({ accountId, userId }) => ({
  accountId,
  userId,
  async start({ analysisId }) {
    const simulation = AnalysisSimulationV2.first({ analysisId });

    const res = new SimulationService({
      simulation,
      accountId: this.accountid
    }).reset();
    await res.startCalculationWorker();

    return {
      analysisId,
      status: "running"
    };
  }
});
