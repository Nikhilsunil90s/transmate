import { AnalysisSimulationV2 } from "../AnalysisSimulationV2";
import { AnalysisSimulationV2Detail } from "../AnalysisSimulationV2-detail";
import { steps } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/_analysis.js";

export const stepManager = ({ docId }) => {
  const simulation = docId && AnalysisSimulationV2.first({ _id: docId });
  const passedSteps = [steps[0]];
  if (simulation) {
    if (simulation.scope) {
      passedSteps.push(steps[0]);
    }
    if (
      AnalysisSimulationV2Detail.find({
        analysisId: simulation.analysisId
      }).count() > 0
    ) {
      passedSteps.push(steps[1]);
    }
    if (simulation.aggregates) {
      passedSteps.push(steps[2]);
      passedSteps.push(steps[3]);
      passedSteps.push(steps[4]);
    }
  }
  return passedSteps;
};
