import { JobManager } from "/imports/utils/server/job-manager.js";
import { EmailBuilder } from "/imports/api/email/server/send-email.js";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { User } from "/imports/api/users/User";
import { check } from "/imports/utils/check.js";
import get from "lodash.get";
import { Roles } from "/imports/api/roles/Roles";

const debug = require("debug")("user:server:new:user");

export const sendNewUserEmail = async (userId, accountId) => {
  check(userId, String);
  check(accountId, String);
  const user = await User.findOne(userId);
  const account = await AllAccounts.findOne(accountId);
  const roles = await Roles.getRolesForUser(userId, `account-${accountId}`);

  const email = get(user, "emails[0].address");
  debug("data in process email %s, docs %o", email, { user, account, roles });

  // to do: capture errors like no roles or no account!
  if (user && email) {
    return new EmailBuilder({
      from: process.env.EMAIL_SEND_FROM,
      to: process.env.EMAIL_DEBUG_TO || "info@transmate.eu", // principal email
      subject: `New user ${user.getName()}  has registered in account ${
        (account || {}).name
      } on Transmate`,
      content: {
        text: `
      new user name: ${user.getName()} 
      email: ${email} 
      from acount: (${(account || {})._id}) ${(account || {}).name},
      users in account: ${((account || {}).userIds || []).length},
      roles :  ${(roles || []).join(",")}`
      }
    }).scheduleMail();
  }
  return { ok: false, status: `user not found:${userId}` };
};

JobManager.on("account.subscribed", "EmailBuilder", async notification => {
  const { userId, accountId } = notification.object;
  check(userId, String);
  check(accountId, String);
  return sendNewUserEmail(userId, accountId);
});
