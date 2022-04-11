import analyses from "/imports/api/_jsonSchemas/fixtures/data.analysis.json";
import simulations from "/imports/api/_jsonSchemas/fixtures/data.analysisSimulation.json";

export const analysis = {
  ...analyses[1],
  simulation: simulations[1]
};

export const security = {
  canEdit: true
};
