import { User } from "/imports/api/users/User.js";

import { Accounts } from "meteor/accounts-base";
import { EmailBuilder } from "/imports/api/email/server/send-email.js";

const debug = require("debug")("method-email");

Accounts.emailTemplates.from = "Transmate <support@transmate.eu>";
Accounts.emailTemplates.siteName = "Transmate";

Accounts.sendEnrollmentEmail = function sendEnrollmentEmail(
  userId,
  email,
  extraTokenData
) {
  const { email: realEmail, user, token } = Accounts.generateResetToken(
    userId,
    email,
    "enrollAccount",
    extraTokenData
  );

  // password page is not a popup on enroll anymore.
  const url = Accounts.urls.resetPassword(token);
  const options = Accounts.generateOptionsForEmail(
    realEmail,
    user,
    url,
    "enrollAccount"
  );
  const userDoc = User.init(user);
  debug("email send enrollment %o", userDoc);
  // eslint-disable-next-line no-new
  new EmailBuilder({
    to: process.env.EMAIL_DEBUG_TO || options.to,
    from: `${process.env.EMAIL_SEND_FROM}`,
    subject: "Your Transmate account has been created",
    tag: "account",
    accountId: userDoc.accountId(),
    meta: {
      target: process.env.REPORTING_TARGET,
      accountId: userDoc.accountId(),
      userId: userDoc._id,
      type: "account",
      id: userDoc._id,
      action: "created"
    },
    templateName: "enrollMail",
    data: {
      userName: userDoc.getName(),
      enrollUrl: url
    }
  }).scheduleMail();
  return {
    email: realEmail,
    user: userDoc,
    token,
    url,
    options
  };
};

Accounts.sendVerificationEmail = function sendVerificationEmail(
  userId,
  email,
  extraTokenData
) {
  const { email: realEmail, user, token } = Accounts.generateVerificationToken(
    userId,
    email,
    extraTokenData
  );
  const url = Accounts.urls.verifyEmail(token);
  const options = Accounts.generateOptionsForEmail(
    realEmail,
    user,
    url,
    "verifyEmail"
  );
  const userDoc = User.init(user);
  new EmailBuilder({
    to: process.env.EMAIL_DEBUG_TO || options.to,
    from: `${process.env.EMAIL_SEND_FROM}`,
    subject: "Confirm your account",
    tag: "account",
    templateName: "accountConfirmationMail",
    data: {
      userName: userDoc.getName(),
      link: url
    },
    accountId: userDoc.accountId(),
    meta: {
      target: process.env.REPORTING_TARGET,
      accountId: userDoc.accountId(),
      userId: userDoc._id,
      type: "account",
      id: userDoc._id,
      action: "confirm"
    }
  }).scheduleMail();
  return {
    email: realEmail,
    user: userDoc,
    token,
    url,
    options
  };
};

Accounts.sendResetPasswordEmail = function sendResetPasswordEmail(
  userId,
  email,
  extraTokenData
) {
  const { email: realEmail, user, token } = Accounts.generateResetToken(
    userId,
    email,
    "resetPassword",
    extraTokenData
  );
  const url = Accounts.urls.resetPassword(token);
  const options = Accounts.generateOptionsForEmail(
    realEmail,
    user,
    url,
    "resetPassword"
  );
  const userDoc = User.init(user);
  debug("email send reset %s for user %o", url, userDoc);
  new EmailBuilder({
    to: process.env.EMAIL_DEBUG_TO || options.to,
    from: `${process.env.EMAIL_SEND_FROM}`,
    subject: "Transmate : Reset your password",
    tag: "account",
    accountId: userDoc.accountId(),
    templateName: "resetPasswordMail",
    data: {
      userName: userDoc.getName(),
      link: url
    },
    meta: {
      target: process.env.REPORTING_TARGET,
      accountId: userDoc.accountId(),
      userId: userDoc._id,
      type: "account",
      id: userDoc._id,
      action: "reset"
    }
  }).scheduleMail();
  return {
    email: realEmail,
    user: userDoc,
    token,
    url,
    options
  };
};
