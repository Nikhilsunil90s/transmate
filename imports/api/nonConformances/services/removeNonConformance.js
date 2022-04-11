import { NonConformance } from "../NonConformance";
import { shipmentAggregation } from "/imports/api/shipments/services/query.pipelineBuilder";

export const removeNonConformance = ({ accountId, userId }) => ({
  accountId,
  userId,
  async remove({ id }) {
    const nonConformance = await NonConformance.first(id);
    this.shipmentId = nonConformance.shipmentId;

    await nonConformance.destroy_async();
    return this;
  },
  async getUIResponse() {
    const srv = shipmentAggregation({ accountId, userId });
    await srv.getUserEntities();
    srv
      .matchId({ shipmentId: this.shipmentId })
      .match({
        options: { noStatusFilter: true },
        fieldsProjection: {}
      })
      .getNonConformances();

    const res = await srv.fetchDirect();
    return res[0] || {};
  }
});
