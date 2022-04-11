import { pipelineBuilder } from "./_pipelineBuilder";

export const getTender = ({ accountId }) => ({
  accountId, // accountId of the caller
  async get({ tenderId }) {
    // option 1: my account -> i can see
    // option 2: bidder account -> depends on status

    const tenders = await pipelineBuilder({ accountId: this.accountId })
      .match({ tenderId })
      .getAccounts()
      .getDocuments()
      .aggregate();

    const tender = tenders[0] || {};

    return tender;
  }
});
