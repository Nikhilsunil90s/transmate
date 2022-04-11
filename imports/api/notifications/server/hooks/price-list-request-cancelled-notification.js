import { JobManager } from "/imports/utils/server/job-manager.js";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { Notification } from "/imports/api/notifications/Notification.js";

// TODO [#321]: userPreference check

export const priceListRequestCanceledHook = async ({ priceList }) => {
  const customer = await AllAccounts.first({
    _id: priceList.customerId
  });
  const users = AllAccounts.getUsers_async(priceList.carrierId, [
    "core-priceList-update",
    "core-priceList-create"
  ]);

  return users.map(user => {
    return Notification.create_async({
      userId: user.id,
      type: "price-list",
      event: "request-cancelled",
      data: {
        priceListId: priceList.id,
        account: customer.name
      }
    });
  });
};

JobManager.on(
  "price-list.request-cancelled",
  "Notification",
  async notification => {
    const priceList = notification.object;
    return priceListRequestCanceledHook({ priceList });
  }
);
