import { NonConformance } from "../NonConformance";
import { shipmentAggregation } from "/imports/api/shipments/services/query.pipelineBuilder";

export const updateNonConformance = ({ accountId, userId }) => ({
  accountId,
  userId,
  async update({ id, update }) {
    const nonConformance = await NonConformance.first(id);
    this.shipmentId = nonConformance.shipmentId;

    const { date, created, ...rest } = update;
    await nonConformance.update_async({
      date: new Date(date),
      created: {
        ...created,
        at: new Date(created.at)
      },
      ...rest
    });
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
