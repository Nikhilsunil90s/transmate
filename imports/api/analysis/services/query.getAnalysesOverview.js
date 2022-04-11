import { pipelineBuilder } from "./_pipelineBuilder";

export const getOverview = ({ accountId, userId }) => ({
  accountId,
  userId,
  get() {
    return pipelineBuilder()
      .getRootDoc({ query: { accountId } })
      .getSimulation({ fields: { name: 1 } })
      .getSwitchPoint({ fields: { name: 1 } })
      .projectName()
      .addStages([
        { $sort: { "created.at": -1 } },
        { $project: { id: "$_id", name: 1, type: 1, created: 1, status: 1 } }
      ])
      .aggregate(); // async
  }
});
