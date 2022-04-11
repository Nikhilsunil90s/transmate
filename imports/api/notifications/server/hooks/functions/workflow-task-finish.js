import { updateTask } from "/imports/api/bpmn-tasks/services/mutation.updateTask";

/**
 * sets task to complete & triggers function to complete workflow
 * @param {{taskId: string; userId?: string}} param0
 */
export const completeTask = ({ taskId, userId, accountId }) =>
  updateTask({ userId, accountId }).update({
    taskId,
    options: { complete: true }
  });
