import { JobManager } from "/imports/utils/server/job-manager.js";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { Notification } from "/imports/api/notifications/Notification.js";

export const partnershipRequestedHook = async ({
  requestedBy,
  requestedTo
}) => {
  const users = await AllAccounts.getUsers_async(requestedTo._id, ["admin"]);
  return Promise.all(
    users.map(user => {
      return Notification.create_async({
        userId: user.id,
        type: "partnership",
        event: "requested",
        data: {
          requestedTo: requestedTo._id,
          requestedBy: requestedBy._id,
          account: requestedBy.name, // the requestedTo party will see this
          accountId: requestedBy._id // the requestedTo party will see this
        }
      });
    })
  );
};

JobManager.on("partnership.requested", "Notification", async notification => {
  const { requestedBy, requestedTo } = notification.object;
  return partnershipRequestedHook({ requestedBy, requestedTo });
});
