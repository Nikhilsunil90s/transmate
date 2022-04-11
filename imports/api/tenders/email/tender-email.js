import moment from "moment";
import { Meteor } from "meteor/meteor";
import TokenGenerationService from "../../allAccounts/server/tokenGeneationSrv.js";

import { User } from "/imports/api/users/User";
import { EmailBuilder } from "/imports/api/email/server/send-email.js";

const debug = require("debug")("email:tender");

export const sendTenderEmail = async ({
  user,
  bidder,
  type,
  accountId,
  accountName,
  tender
}) => {
  debug("send tender email to bidder %s", bidder.name);
  if (!["request", "cancel", "suspend", "won", "lost"].includes(type)) {
    throw Error(`type is unknown!${type}`);
  }
  const route = {
    page: "tender",
    _id: tender._id,
    section: "data"
  };
  const tokenString = await TokenGenerationService.generateToken(
    route,
    user._id,
    "login-redirect"
  );
  const token = Meteor.absoluteUrl(`login-token/${tokenString}`);

  // normal link
  const link = Meteor.absoluteUrl(`tender/${tender._id}/data`);

  const sender = await User.profile(tender.created.by);

  // todo: check preference here:
  const subject = {
    request: `${accountName} Tender ${tender.title} started for ${bidder.name}`,
    suspend: `${accountName} Tender ${tender.title}  suspended for ${bidder.name}`,
    cancel: `${accountName} Tender ${tender.title}  cancelled for ${bidder.name}`,
    won: `${accountName} Tender ${tender.title}  won for ${bidder.name}`,
    lost: `${accountName} Tender ${tender.title}  lost for ${bidder.name}`
  };
  const nextWeek = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000);
  return new EmailBuilder({
    to: user.getEmail(),

    // from: sender.getEmail(),
    // replyTo: sender.getEmail(),
    subject: subject[type],
    templateName: "tenderMail",
    accountId,
    data: {
      to: {
        accountId: bidder._id || bidder.accountId,
        accountName: bidder.name,
        email: user.getEmail(),
        name: user.getName() === user.getEmail() ? bidder.name : user.getName()
      },
      from: {
        accountName,
        name: sender.getName(),
        email: sender.getEmail()
      },
      id: tender._id,
      title: tender.title,

      dueDate: `${moment(tender.dueDate || nextWeek).format("D MMMM HH")}h`,
      bidder: { name: bidder.name },
      customer: { name: accountName },
      request: type === "request",
      suspend: type === "suspend",
      cancel: type === "cancel",
      won: type === "won",
      lost: type === "lost",
      link,
      token
    },
    meta: {
      userId: user._id,
      accountId: bidder._id || bidder.accountId,
      type: "tender",
      id: tender._id,
      version: tender.version
    }
  }).scheduleMail();
};
