/* eslint-disable no-use-before-define */
import { JobManager } from "/imports/utils/server/job-manager.js";
import { EmailBuilder } from "/imports/api/email/server/send-email.js";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { Notification } from "/imports/api/notifications/Notification";

import { checkUserPreferenceDirect } from "./functions/checkUserPreferences";

const PREFERENCE_KEY = "price-list-released";

export const priceListReleasedHook = async ({ priceList }) => {
  const [customer, carrier] = await Promise.all([
    AllAccounts.first({ _id: priceList.customerId }),
    AllAccounts.first({ _id: priceList.carrierId })
  ]);

  const customerUsers = await AllAccounts.getUsers_async(priceList.customerId, [
    "core-priceList-update",
    "core-priceList-create"
  ]);

  return Promise.all([
    sendMail({ customerUsers, customer, carrier, priceList }),
    customerNotifications({ customerUsers, priceList, carrier })
  ]);
};

JobManager.on(
  "price-list.released",
  "EmailAndNotifications",
  async notification => {
    const priceList = notification.object;
    return priceListReleasedHook({ priceList });
  }
);

const sendMail = ({ customerUsers, customer, carrier, priceList }) => {
  if (!(customer && carrier)) return null;
  return customerUsers.map(async user => {
    const wantsNotification = checkUserPreferenceDirect(
      PREFERENCE_KEY,
      "email",
      user
    );
    if (!wantsNotification) return null;

    return new EmailBuilder({
      from: `${customer.name} - ${process.env.EMAIL_SEND_FROM}`,
      to: process.env.EMAIL_DEBUG_TO || user.getEmail(), // principal email
      subject: `New rate card by ${carrier.name}`,
      content: { text: Meteor.absoluteUrl(`price-list/${priceList._id}`) },
      tag: "priceList"
    }).scheduleMail();
  });
};

const customerNotifications = ({ customerUsers, priceList, carrier }) => {
  return customerUsers.map(user => {
    const wantsNotification = checkUserPreferenceDirect(
      PREFERENCE_KEY,
      "app",
      user
    );
    if (!wantsNotification) return null;
    return Notification.create_async({
      userId: user.id,
      type: "price-list",
      event: "released",
      data: {
        priceListId: priceList.id,
        account: carrier.name
      }
    });
  });
};
