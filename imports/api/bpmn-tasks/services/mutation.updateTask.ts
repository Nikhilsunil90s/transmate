import { Task } from "../Task";
import SecurityChecks from "/imports/utils/security/_security";
import { callCloudFunction } from "/imports/utils/server/ibmFunctions/callFunction";

export const updateTask = ({ accountId, userId }) => ({
  accountId,
  userId,
  async update({ taskId, update, options }) {
    const task = await Task.first(taskId);
    SecurityChecks.checkIfExists(task);
    await Promise.all([
      task.update_async({
        ...(update ? { collectedData: update } : undefined),
        ...(options.complete ? { finished: true } : undefined)
      }),
      task.push({
        updates: {
          action: options.complete ? "flag complete" : "update",
          userId: this.userId,
          accountId: this.accountId,
          ts: new Date()
        }
      })
    ]);

    await callCloudFunction(
      "startWorkflow",
      {
        filter: { id: task.workflowId }
      },
      { userId: this.userId, accountId: this.accountId }
    );
    return { taskId, status: "updated" };
  }
});
