import { Workflow } from "../Workflow";

export const getWorkflows = ({ accountId, userId }) => ({
  accountId,
  userId,
  get({ query = {} }) {
    return Workflow.where(
      {
        ...query,
        accountId: this.accountId,
        deleted: { $ne: true }
      },
      {
        fields: {
          name: 1,
          created: 1,
          status: 1
        }
      }
    );
  }
});
