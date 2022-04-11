import { JobManager } from "/imports/utils/server/job-manager.js";

import { EmailBuilder } from "/imports/api/email/server/send-email.js";

JobManager.on("upgrade.request", "EmailBuilder", async notification => {
  const { account, user, reference } = notification.object;

  return new EmailBuilder({
    from: `${process.env.EMAIL_SEND_FROM}`, // `${user.getName()} <${user.getEmail()}>`,
    "reply-to": `${user.getName()} <${user.getEmail()}>`,
    to: process.env.EMAIL_DEBUG_TO || process.env.EMAIL_SEND_FROM,
    subject: `Account upgrade requested by ${user.getName()} from ${
      account.name
    } `,
    tag: "upgrade",
    content: {
      text: `
    ${user.getName()} <${user.getEmail()}> from ${
        account.name
      } just clicked the Upgrade button. Reference: ${reference}.`
    }
  }).scheduleMail();
});
