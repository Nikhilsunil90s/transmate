import { pipelineBuilder } from "./_pipelineBuilder";

export const getAnalysis = ({ accountId, userId }) => ({
  accountId,
  userId,
  async get({ analysisId }) {
    const res = await pipelineBuilder()
      .getRootDoc({ query: { _id: analysisId } })
      .getSimulation({})
      .getSwitchPoint({})
      .projectName()
      .aggregate();

    return res[0];
  }
});
