import { Mongo } from "meteor/mongo";
import Model from "../Model.js";

import { AnalysisSimulationV2DetailSchema } from "../_jsonSchemas/simple-schemas/collections/analysis-simulation-v2";

class AnalysisSimulationV2Detail extends Model {}

AnalysisSimulationV2Detail._collection = new Mongo.Collection(
  "analysis.simulationV2.details"
);

AnalysisSimulationV2Detail._collection.attachSchema(
  AnalysisSimulationV2DetailSchema
);
AnalysisSimulationV2Detail._collection = AnalysisSimulationV2Detail.updateByAt(
  AnalysisSimulationV2Detail._collection
);
export { AnalysisSimulationV2Detail };
