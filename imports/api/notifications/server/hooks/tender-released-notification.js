import { JobManager } from "/imports/utils/server/job-manager.js";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { Notification } from "/imports/api/notifications/Notification";
import { checkUserPreferenceDirect } from "./functions/checkUserPreferences";

const PREFERENCE_KEY = "tender-released-notification";

export const tenderReleasedHook = async ({ tender }) => {
  const acc = await AllAccounts.first(tender.accountId, {
    fields: { name: 1 }
  });
  const name = acc && acc.name;

  return (tender.carrierIds || []).map(async carrierId => {
    const users = AllAccounts.getUsers_async(carrierId, [
      "core-tender-update",
      "core-tender-create"
    ]);

    return Promise.all(
      users.map(async user => {
        const wantsNotification = checkUserPreferenceDirect(
          PREFERENCE_KEY,
          "app",
          user
        );
        if (!wantsNotification) return null;
        return Notification.create_async({
          userId: user.id,
          type: "tender",
          event: "released",
          data: {
            tenderId: tender.id,
            number: tender.number,
            title: tender.title,
            account: name
          }
        });
      })
    );
  });
};

JobManager.on("tender.released", "Notification", async notification => {
  const tender = notification.object;
  return tenderReleasedHook({ tender });
});
