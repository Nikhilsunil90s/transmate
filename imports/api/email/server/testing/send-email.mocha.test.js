/* eslint-disable func-names */
import { expect } from "chai";

import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { EmailBuilder } from "/imports/api/email/server/send-email.js";

const debug = require("debug")("email:send:email");

let defaultMongo;

describe("email:send", function() {
  before(async () => {
    debug("create mongo connections");
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo.js");
      await defaultMongo.connect();
    }

    debug("dynamic import of resetdb");
    await resetDb({ resetUsers: true });
  });
  it("send email to me with postmark", async function() {
    this.timeout(10000);
    const result = await new EmailBuilder({
      from: "jan@transmate.eu",
      to: "jan+testEmail@transmate.eu",
      subject: "test email with postmark",
      templateName: "resetPasswordMail",
      data: { userName: "janC", link: "linkToReset" },
      accountId: "testAccountId"
    }).buildAndSend();

    debug("result of email sending", result);
    expect(result.ok).to.equal(true);
  });

  it("send email to me with smtp", async function() {
    this.timeout(10000);
    const result = await new EmailBuilder({
      from: "jan@transmate.eu",
      to: "jan+testEmail@transmate.eu",
      subject: "test email with sendgrid",
      templateName: "resetPasswordMail",
      data: { userName: "janC", link: "linkToReset" },
      accountId: "testAccountId",
      service: "smtp"
    }).buildAndSend();
    debug("result of email sending", result);
    expect(result.ok).to.equal(true);
  });
  it("send email through job", async function() {
    const result = await new EmailBuilder({
      from: "jan@transmate.eu",
      to: "jan+testEmail@transmate.eu",
      subject: "test email with sendgrid",
      templateName: "resetPasswordMail",
      data: { userName: "janC", link: "linkToReset" },
      accountId: "testAccountId"
    }).scheduleMail();
    debug("result of email scheduling", result);
    expect(result.ok).to.equal(true);
  });

  it("send email new user email", async function() {
    const account = {
      _id: "123",
      name: "testAccount"
    };
    const user = {
      getName() {
        return "jan";
      },

      getEmail() {
        return "jan+testEmail@transmate.eu";
      }
    };

    const result = await new EmailBuilder({
      from: "jan@transmate.eu",
      to: "jan+testEmail@transmate.eu",
      subject: `New user ${user.getName()}  has registered in account ${
        account.name
      } on Transmate`,
      content: {
        text: `
        new user name:  ${user.getName()} 

        email:          ${user.getEmail()} 
        from acount:    (${account._id}) ${account.name},
        users in account: ${(account.userIds || []).length}`
      }
    }).buildAndSend();
    debug("result of email scheduling", result);
    expect(result.ok).to.equal(true);
  });
});
