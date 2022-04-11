// fn
import { callCloudFunction } from "/imports/utils/server/ibmFunctions/callFunction";
import SecurityChecks from "/imports/utils/security/_security";

// data
import { AnalysisSimulationV2 } from "../AnalysisSimulationV2";
import { AnalysisSimulationV2Detail } from "../AnalysisSimulationV2-detail";

const debug = require("debug")("simulation:data");

class SimulationService {
  constructor({ simulation, accountId }) {
    this.simulation = simulation;
    this.accountId = accountId;
    SecurityChecks.checkIfExists(this.simulation);

    this.analysisId = simulation.analysisId;
  }

  reset() {
    // simulation doc:
    AnalysisSimulationV2._collection.update(
      { analysisId: this.analysisId },
      {
        $set: {
          status: "running",
          steps: ["options", "data"]
        },
        $unset: { aggregates: 1 }
      }
    );

    // remove old priceList results
    AnalysisSimulationV2Detail._collection.update(
      { analysisId: this.analysisId },
      { $unset: { priceLists: 1 } },
      { multi: true }
    );
    return this;
  }

  updateMasterDoc({ update }) {
    if (update) {
      debug("updating masterDocument: %o", update);
      this.simulation.update(update);
    }
    return this;
  }

  async startCalculationWorker() {
    debug("start calculation for %s ", this.analysisId);
    callCloudFunction(
      "runStartAnalysisWorker",
      {
        analysisId: this.analysisId,
        accountId: this.accountId
      },
      context
    );
    return this;
  }

  set(item) {
    Object.entries(item).forEach(([k, v]) => {
      this[k] = v;
    });
    return this;
  }

  get(item) {
    return this[item];
  }
}

export { SimulationService };
