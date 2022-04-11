import { pipelineBuilder } from "./_pipelineBuilder";

export const getPriceList = ({ accountId, userId }) => ({
  accountId,
  userId,
  get({ priceListId }) {
    return pipelineBuilder({ accountId, userId })
      .match({ priceListId })
      .project({}, true)
      .fetch();
  }
});
