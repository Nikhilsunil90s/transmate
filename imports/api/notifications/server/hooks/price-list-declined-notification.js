import { JobManager } from "/imports/utils/server/job-manager.js";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { Notification } from "/imports/api/notifications/Notification.js";
import { checkUserPreferenceDirect } from "./functions/checkUserPreferences";

const PREFERENCE_KEY = "price-list-declined-notification";

export const priceListDeclinedHook = async ({ priceList }) => {
  const customer = AllAccounts.first({
    _id: priceList.customerId
  });
  const users = AllAccounts.getUsers_async(priceList.carrierId, [
    "core-priceList-update",
    "core-priceList-create"
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
        type: "price-list",
        event: "declined",
        data: {
          priceListId: priceList.id,
          account: customer.name,
          title: priceList.title
        }
      });
    })
  );
};

JobManager.on("price-list.declined", "Notification", async notification => {
  const priceList = notification.object;
  return priceListDeclinedHook({ priceList });
});
