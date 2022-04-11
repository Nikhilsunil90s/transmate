import { JobManager } from "/imports/utils/server/job-manager.js";
import { EmailBuilder } from "/imports/api/email/server/send-email.js";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { checkUserPreferenceDirect } from "./functions/checkUserPreferences";

const PREFERENCE_KEY = "price-list-declined-email";

export const priceListDeclinedHook = async ({ priceList }) => {
  const [customer, carrier] = await Promise.all([
    AllAccounts.first({
      _id: priceList.customerId
    }),
    AllAccounts.first({
      _id: priceList.carrierId
    })
  ]);
  if (!(customer && carrier)) return null;

  const users = AllAccounts.getUsers_async(priceList.carrierId, [
    "core-priceList-update",
    "core-priceList-create"
  ]);

  return Promise.all(
    users.map(async user => {
      const wantsNotification = checkUserPreferenceDirect(
        PREFERENCE_KEY,
        "mail",
        user
      );
      if (!wantsNotification) return null;
      return new EmailBuilder({
        from: `${customer.name} - ${process.env.EMAIL_SEND_FROM}`,
        to: process.env.EMAIL_DEBUG_TO || user.getEmail(),
        subject: `${customer.name} declined your price list`,
        content: { text: Meteor.absoluteUrl(`price-list/${priceList._id}`) },
        tag: "priceList"
      }).scheduleMail();
    })
  );
};

JobManager.on("price-list.declined", "EmailBuilder", async notification => {
  const priceList = notification.object;
  return priceListDeclinedHook({ priceList });
});
