import { JobManager } from "/imports/utils/server/job-manager.js";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { Notification } from "/imports/api/notifications/Notification.js";

// TODO [#323]: userPreference check

export const priceListRequestedHook = async ({ priceList }) => {
  const customer = AllAccounts.first({
    _id: priceList.customerId
  });
  const users = await AllAccounts.getUsers_async(priceList.carrierId, [
    "core-priceList-update",
    "core-priceList-create"
  ]);

  return users.map(user => {
    return Notification.create_async({
      userId: user.id,
      type: "price-list",
      event: "requested",
      data: {
        priceListId: priceList.id,
        account: customer.name
      }
    });
  });
};

JobManager.on("price-list.requested", "Notification", async notification => {
  const priceList = notification.object;
  return priceListRequestedHook({ priceList });
});
