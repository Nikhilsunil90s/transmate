import dot from "dot-object";
import difference from "lodash.difference";
import { AnalysisSimulationV2 } from "../AnalysisSimulationV2";
import { AnalysisSimulationV2Detail } from "../AnalysisSimulationV2-detail";
import SecurityChecks from "/imports/utils/security/_security";

const debug = require("debug")("simulation:apollo");

export const saveSimulation = ({ accountId, userId }) => ({
  accountId,
  userId,
  async init({ analysisId, fields = {} }) {
    this.analysisId = analysisId;
    this.simulation = await AnalysisSimulationV2.first(
      { analysisId: this.analysisId },
      { fields: { _id: 1, ...fields } }
    );
    SecurityChecks.checkIfExists(this.simulation);
    return this;
  },
  async update({ update, reset }) {
    dot.keepArray = true;
    const updateDot = dot.dot(update);

    debug({ updateDot });
    await this.simulation.update_async(updateDot);

    if (reset) {
      debug("resetting analysis %s ", this.analysisId);

      // remove all existing quantity fields in the detail table
      await AnalysisSimulationV2Detail._collection.remove({
        analysisId: this.analysisId
      });
    }

    // return stepManager(this.analysisId);
  },
  async nextStep({ nextStep }) {
    await this.simulation.push({ steps: nextStep }, true);
  },
  async updatePriceLists({ priceLists = [] }) {
    const existingPriceLists = this.simulation.priceLists || [];
    const existingPriceListIds = existingPriceLists.map(({ id }) => id);

    const priceListIds = priceLists.map(({ id }) => id);

    // difference <test><benchmark>
    const removed = difference(existingPriceListIds, priceListIds);
    const added = difference(priceListIds, existingPriceListIds);

    const updatedPriceLists = [
      ...existingPriceLists.filter(({ id }) => !removed.includes(id)),
      ...priceLists.filter(({ id }) => added.includes(id))
    ];

    debug("simulation pricelists, %o", updatedPriceLists);

    await this.simulation.update_async({ priceLists: updatedPriceLists });

    return {
      analysisId: this.analysisId,
      priceLists: updatedPriceLists
    };
  }
});
