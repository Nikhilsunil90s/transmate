import { JobManager } from "/imports/utils/server/job-manager.js";
import get from "lodash.get";
import { Notification } from "/imports/api/notifications/Notification";
import { Task } from "/imports/api/bpmn-tasks/Task";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { completeTask } from "./functions/workflow-task-finish";
import { PriceRequest } from "/imports/api/priceRequest/PriceRequest";
import { User } from "/imports/api/users/User";

const debug = require("debug")("price=request:notifications:bidReceived");

const createNotification = ({
  requestedBy,
  priceRequest,
  carrier,
  statusChange
}) => {
  return Notification.create_async({
    userId: requestedBy,
    type: "price-request",
    event: "bidReceived",
    data: {
      priceRequestId: priceRequest._id,
      account: carrier.name,
      accountId: carrier.id,
      status: statusChange ? "entered" : "updated",
      title: priceRequest.title
    }
  });
};

/**
 * function to handle a bid that has been received
 * priceList needs fields: {carrierId}
 * @param {{ priceRequestId: string, userId: string, priceList: Object, statusChange: boolean}} param0
 *
 */
export const priceRequestbidReceivedHook = async ({
  priceRequestId,
  userId,
  priceList,
  statusChange
}) => {
  if (!priceRequestId) return false;
  const priceRequest = await PriceRequest.first(priceRequestId, {
    fields: { _id: 1, title: 1, created: 1 }
  });

  // clear any task associated with this priceRequest (and user)
  // 1 retrieve accountId
  // 2 flag tasks complete
  const allTasks = await Task.where(
    {
      "references.id": priceRequestId,
      "references.type": "priceRequest",
      "userParams.userIds": userId,
      finished: false,
      deleted: false
    },
    { fields: { _id: 1 } }
  );

  const accountId = await User.getAccountId(userId);

  await Promise.all(
    allTasks.map(task => completeTask({ taskId: task._id, userId, accountId }))
  );

  // also create notification
  const carrier = await AllAccounts.first(
    { _id: priceList.carrierId },
    { fields: { name: 1 } }
  );

  // to do : make the selection more flexible , look at core-roles
  // const customerUsers = AllAccounts.getUsers_async(priceList.customerId, [
  //   "core-priceRequest-update",
  //   "core-priceRequest-create"
  // ]);

  const requestedBy =
    get(priceRequest, "requestedBy") || get(priceRequest, "created.by");

  debug("set notification %s for %o", priceList.customerId, requestedBy);
  if (requestedBy) {
    await createNotification({
      requestedBy,
      priceRequest,
      carrier,
      statusChange
    });
  }
  return true;
};

JobManager.on(
  "price-request.bidReceived",
  "Notification",
  async notification => {
    const {
      priceRequestId,
      userId,
      priceList,
      statusChange
    } = notification.object;
    return priceRequestbidReceivedHook({
      priceRequestId,
      userId,
      priceList,
      statusChange
    });
  }
);
