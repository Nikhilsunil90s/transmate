import { JobManager } from "../../../utils/server/job-manager.js";
import { NonConformance } from "../NonConformance";
import { shipmentAggregation } from "/imports/api/shipments/services/query.pipelineBuilder";

export const addNonConformance = ({ accountId, userId }) => ({
  accountId,
  userId,
  async add({ shipmentId, data }) {
    const { date, created, ...rest } = data;
    this.shipmentId = shipmentId;
    const nc = await NonConformance.create_async({
      shipmentId,
      accountId,
      date: date ? new Date(date) : new Date(),
      created: {
        by: created?.by || this.userId,
        at: new Date(created?.at)
      },
      ...rest
    });
    JobManager.post("non-conformance.added", nc);
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
