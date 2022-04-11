import { callCloudFunction } from "/imports/utils/server/ibmFunctions/callFunction";
import { WorkflowService } from "./workflowService";
import { fnContext } from "../../_interfaces/context";

interface CreateWorkFlowProps {
  references: any;
  workflow: any;
  data: any;
  accountId: string;
}

export const createWorkflow = ({ accountId, userId }: fnContext) => ({
  accountId,
  userId,
  async create({
    references,
    workflow,
    data,
    accountId: referencedAccountId
  }: CreateWorkFlowProps) {
    const workflowDoc = await new WorkflowService({
      accountId: referencedAccountId || this.accountId
    })
      .create({ references, workflow, data })
      .store();

    callCloudFunction(
      "startWorkflow",
      { filter: { id: workflowDoc._id } },
      { userId: this.userId, accountId: this.accountId }
    );
    return this;
  },

  getUIResponse() {
    return true;
  }
});
