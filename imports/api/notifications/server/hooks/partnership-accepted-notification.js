import { JobManager } from "/imports/utils/server/job-manager.js";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { Notification } from "/imports/api/notifications/Notification.js";

// FIXME: need test
export const partnershipAcceptedHook = async ({ requestedBy, acceptedBy }) => {
  const partner = await AllAccounts.first({ _id: acceptedBy });
  const users = await AllAccounts.getUsers_async(requestedBy, ["admin"]);
  return Promise.all(
    users.map(user => {
      return Notification.create_async({
        userId: user.id,
        type: "partnership",
        event: "accepted",
        data: {
          accountId: partner.id,
          account: partner.name
        }
      });
    })
  );
};

JobManager.on("partnership.accepted", "Notification", async notification => {
  const { requestedBy, acceptedBy } = notification.object;
  return partnershipAcceptedHook({ requestedBy, acceptedBy });
});
