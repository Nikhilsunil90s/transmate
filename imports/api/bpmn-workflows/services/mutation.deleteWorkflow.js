import SecurityChecks from "/imports/utils/security/_security";

import { Workflow } from "../Workflow";
import { Task } from "../../bpmn-tasks/Task";

export const deleteWorkflow = ({ accountId, userId }) => ({
  accountId,
  userId,
  async init({ workflowId }) {
    this.workflow = await Workflow.first({ _id: workflowId });
    SecurityChecks.checkIfExists(this.workflow);

    return this;
  },
  async runSecurityChecks() {
    // TODO [#242]: security checks
    // is user allowed to remove a workflow??

    return this;
  },
  async delete() {
    await this.workflow.update_async({ deleted: true });

    // stop all tasks:
    await Task._collection.update(
      { workflowId: this.workflowId },
      { $set: { deleted: true } },
      { multi: true }
    );
    return this;
  },
  getUIResponse() {
    return true;
  }
});
