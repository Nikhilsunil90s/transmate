import { JobManager } from "/imports/utils/server/job-manager.js";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { Notification } from "/imports/api/notifications/Notification.js";
import { sendPriceListApproved } from "/imports/api/email/server/emailTemplates/price-list-approved-email.js";
import { checkUserPreferenceDirect } from "./functions/checkUserPreferences";

const PREFERENCE_KEY = "price-list-approved";

export const priceListApprovedHook = async ({ priceList }) => {
  const customer = await AllAccounts.first({
    _id: priceList.customerId
  });

  // send email
  sendPriceListApproved(priceList);

  const users = await AllAccounts.getUsers_async(priceList.carrierId, [
    "core-priceList-update",
    "core-priceList-create"
  ]);

  return Promise.all(
    users.map(async user => {
      const wantsNotification = await checkUserPreferenceDirect(
        PREFERENCE_KEY,
        "app",
        user
      );
      if (!wantsNotification) return null;
      return Notification.create_async({
        userId: user.id,
        type: "price-list",
        event: "approved",
        data: {
          priceListId: priceList.id,
          account: customer.name,
          title: priceList.title
        }
      });
    })
  );
};

JobManager.on("price-list.approved", "Notification", async notification => {
  const priceList = notification.object;
  return priceListApprovedHook({ priceList });
});
