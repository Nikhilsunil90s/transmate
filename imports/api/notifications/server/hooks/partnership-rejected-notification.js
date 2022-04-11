import { JobManager } from "/imports/utils/server/job-manager.js";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { Notification } from "/imports/api/notifications/Notification.js";

export const partnershipRejectedHook = async ({ requestedBy, rejectedBy }) => {
  const partner = await AllAccounts.first({ _id: rejectedBy });
  const users = await AllAccounts.getUsers_async(requestedBy, ["admin"]);
  return Promise.all(
    users.map(user => {
      return Notification.create_async({
        userId: user.id,
        type: "partnership",
        event: "rejected",
        data: {
          accountId: partner.id,
          account: partner.name
        }
      });
    })
  );
};

JobManager.on("partnership.rejected", "Notification", async notification => {
  const { requestedBy, rejectedBy } = notification.object;
  return partnershipRejectedHook({ requestedBy, rejectedBy });
});
