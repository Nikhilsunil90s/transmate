/* eslint-disable no-unreachable */
import get from "lodash.get";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { addressFormatter } from "/imports/api/addresses/services/addressFormatter";
import { Meteor } from "meteor/meteor";
import { check } from "/imports/utils/check.js";
import { Notification } from "/imports/api/notifications/Notification.js";
import { getReferenceNumber } from "/imports/api/shipments/utils.js";

// import moment from "moment";
// import { getShipmentStakeholders } from "./functions/get-shipment-stakeholders";

import { EmailBuilder } from "/imports/api/email/server/send-email.js";
import { Shipment } from "/imports/api/shipments/Shipment";
import { User } from "/imports/api/users/User";

const DEFAULT_LOCALE = "en-GB";
const SHIPMENT_FIELDS = {
  accountId: 1,
  shipperId: 1,
  carrierIds: 1,
  number: 1,
  "delivery.datePlanned": 1,
  "pickup.datePlanned": 1,
  "pickup.location": 1,
  "delivery.location": 1
};

/** triggered from cron, account and params are passed in
 * User preference has been pre-filtered in the cron
 */
export const shipmentAlertFillOut = async ({
  shipmentId,
  userId,
  accountId,
  app,
  mail
}) => {
  check(shipmentId, String);
  check(userId, String);
  check(accountId, String);
  const result = { mail, app };
  const shipment = await Shipment.first(shipmentId, {
    fields: SHIPMENT_FIELDS
  });
  const user = await User.profile(userId);
  result.userId = get(user, "_id", "user not found");
  const customer = await AllAccounts.first(shipment.shipperId);

  if (user && mail) {
    result.mail = await new EmailBuilder({
      from: `${customer.name} - ${process.env.EMAIL_SEND_FROM}`,
      to: process.env.EMAIL_DEBUG_TO || user.getEmail(),
      subject: `Shipment ${shipment.number} should be filled out`,
      meta: {
        target: process.env.REPORTING_TARGET,
        accountId,
        type: "shipment",
        id: shipment.id,
        action: "fillOut"
      },
      accountId: shipment.accountId, // owner of shipment
      templateName: "shipmentFillOut",
      tag: "shipment",
      data: {
        userName: user.getName(),
        number: getReferenceNumber(shipment),
        plannedDelivery: new Intl.DateTimeFormat(
          get(user, "preferences.locale", DEFAULT_LOCALE),
          { dateStyle: "full", timeStyle: "long" }
        ).format(shipment.delivery.datePlanned),
        deliveryLocation: addressFormatter({
          location: shipment.delivery.location
        }),
        link: Meteor.absoluteUrl(`shipment/${shipment.id}`)
      }
    }).scheduleMail();
  }

  if (user && app) {
    result.app = Notification.create({
      userId,
      type: "shipment",
      event: "fill-out",
      data: {
        shipmentId: shipment.id,
        account: shipment.account,
        number: getReferenceNumber(shipment)
      }
    });
  }
  return result;
};
