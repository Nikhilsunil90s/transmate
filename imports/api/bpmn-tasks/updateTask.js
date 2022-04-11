import SecurityChecks from "/imports/utils/security/_security";
import { callCloudFunction } from "/imports/utils/server/ibmFunctions/callFunction";

import { Task } from "./Task";

const debug = require("debug")("workflows:methods");

const updateTask = ({ taskId, accountId, update, options }) => {
  debug("options: %o", options);
  const task = Task.first(taskId);
  SecurityChecks.checkIfExists(task);
  task.update({
    ...(update ? { collectedData: update } : undefined),
    ...(options.complete ? { finished: true } : undefined)
  });
  task.push({
    updates: {
      action: options.complete ? "flag complete" : "update",
      userId: this.userId,
      accountId,
      ts: new Date()
    }
  });

  callCloudFunction(
    "startWorkflow",
    { filter: { id: task.workflowId } },
    { userId: this.userId, accountId: this.accountId }
  );
  return { taskId, status: "updated" };
};

export default updateTask;
