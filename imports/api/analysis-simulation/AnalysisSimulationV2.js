import { Mongo } from "meteor/mongo";
import Model from "../Model.js";

import { AnalysisSimulationV2Schema } from "/imports/api/_jsonSchemas/simple-schemas/collections/analysis-simulation-v2.js";

// fn
import { stepManager } from "./services/stepsManager";

class AnalysisSimulationV2 extends Model {
  // eslint-disable-next-line camelcase
  static before_create(obj) {
    obj.params = {
      currency: "EUR" // default to EUR
    };
    return obj;
  }

  // eslint-disable-next-line camelcase
  static before_save(obj, docId) {
    obj.steps = stepManager({ docId });
    return obj;
  }
}

AnalysisSimulationV2._collection = new Mongo.Collection(
  "analysis.simulationV2"
);

AnalysisSimulationV2._collection.attachSchema(AnalysisSimulationV2Schema);
AnalysisSimulationV2._collection = AnalysisSimulationV2.updateByAt(
  AnalysisSimulationV2._collection
);
export { AnalysisSimulationV2 };
