import { JobManager } from "/imports/utils/server/job-manager.js";
import { Meteor } from "meteor/meteor";
import get from "lodash.get";
import { Notification } from "/imports/api/notifications/Notification";
import { User } from "/imports/api/users/User";

import { getPriceRequestAccountsData } from "./functions/get-price-request-accounts-data";
import { PriceRequest } from "/imports/api/priceRequest/PriceRequest";
import { EmailBuilder } from "/imports/api/email/server/send-email.js";

const debug = require("debug")("price-request.expired:notifications");

const createNotification = ({ user, data }) => {
  Notification.create({
    userId: user._id,
    type: "price-request",
    event: "ended",
    data
  });
};

export const priceRequestExpiredHook = async priceRequestId => {
  if (typeof priceRequestId !== "string") throw Error("id should be a string!");
  const priceRequest = await PriceRequest.first(priceRequestId);
  const logging = { mails: 0 };
  debug("pr id %s, obj %o", priceRequestId, priceRequest._id);
  const requestedBy =
    get(priceRequest, "requestedBy") || get(priceRequest, "created.by");
  debug("send email to creator:", requestedBy);
  if (priceRequest && requestedBy) {
    const { customer } = await getPriceRequestAccountsData(priceRequest);
    const user = await User.profile(requestedBy);
    if (user) {
      // set notification
      logging.mails += 1;
      createNotification({
        user,
        data: {
          priceRequestId: priceRequest._id,
          account: customer.name,
          accountId: customer.id,
          title: priceRequest.title
        }
      });

      // send email
      const link = Meteor.absoluteUrl(
        `price-request/${priceRequest._id}/partners`
      );
      logging.sendResult = await new EmailBuilder({
        to: user.getEmail(),
        meta: {
          userId: user._id,
          accountId: customer._id
        },
        accountId: customer._id,
        tag: "priceRequest",
        subject: `Price request ${priceRequest.title} has expired!`,
        content: {
          text: `
Price request for ${priceRequest.title} has expired!
Due date was ${priceRequest.dueDate}.

Carriers invited : ${get(
            priceRequest,
            "calculation.summary.totalRequested",
            0
          )} 
Carriers answered: ${get(priceRequest, "calculation.summary.totalSubmitted", 0)}

Please allocate or relaunch this priceRequest:
${link}
`
        }
      }).scheduleMail();
    }
    return logging;
  }
  return undefined;
};

JobManager.on("price-request.expired", "Email", async notification => {
  const { priceRequestId } = notification.object;
  return priceRequestExpiredHook(priceRequestId);
});
