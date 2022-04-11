import { JobManager } from "/imports/utils/server/job-manager.js";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { Notification } from "/imports/api/notifications/Notification";
import { checkUserPreference } from "./functions/checkUserPreferences";

const PREFERENCE_KEY = "tender-submitted-notification";

JobManager.on("tender.submitted", "send-notification", async notification => {
  const tender = notification.object;
  const { priceList } = notification.info;
  const { contacts = [] } = tender;
  await Promise.all(
    contacts.map(async ({ userId }) => {
      if (await checkUserPreference(PREFERENCE_KEY, "app", userId)) {
        const acc = await AllAccounts.first(priceList.accountId);
        const name = acc && acc.name;
        await Notification.create({
          userId,
          type: "tender",
          event: "submitted",
          data: {
            tenderId: tender.id,
            number: tender.number,
            title: tender.title,
            account: name
          }
        });
      }
    })
  );
  return "done";
});
