/* eslint-disable func-names */
import { expect, assert } from "chai";
import { createHtml } from "../process-template";

import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { DocTemplate } from "/imports/api/templates/Template";
import { getHBValues } from "/imports/api/templates/templateHelpers";

const debug = require("debug")("email:template");

let defaultMongo;
describe("email", function() {
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
  it("create html template", function() {
    const template = "<p>I am {{name}}</p>";
    const data = { name: "Jan" };
    const result = createHtml({ template, data });
    expect(result).to.be.an("object");
    expect(result.html).to.equal("<p>I am Jan</p>");
  });

  it("create html template, data is empty (error)", function() {
    const template = "<p>I am {{name}}</p>";
    const data = null;
    assert.throw(
      () => {
        createHtml({ template, data });
      },
      Error,
      "template data not set!"
    );
  });

  it("create html template, template not valid (error)", function() {
    const template = "<pI am {{name}}</p>";
    const data = { name: "Jan" };
    assert.throw(
      () => {
        createHtml({ template, data });
      },
      Error,
      "issue with template, not valid html!"
    );
  });

  it("create html template, data contains invald html", function() {
    const template = "<p>I am {{name}}</p>";
    const data = { name: "<p Jan</p>" };
    const result = createHtml({ template, data });
    expect(result).to.be.an("object");
    expect(result.text).to.equal("I am <p Jan</p>");
  });

  it("gets db mail template", async function() {
    const mailTemplate = await DocTemplate.get({
      name: "resetPasswordMail",
      accountId: "testId"
    });

    // debug({ mailTemplate });
    expect(mailTemplate).to.be.an("object");
    expect(mailTemplate.template).to.be.a("string");
    const values = getHBValues(mailTemplate.template);
    expect(values).to.eql({ userName: "data-userName", link: "data-link" });
  });

  it("converts db template to html email", async function() {
    const link = "TransmatePasswordResetLink";
    const userName = "TestUserA";
    const mailTemplate = await DocTemplate.get({
      name: "resetPasswordMail",
      accountId: "testId"
    });

    const result = createHtml({
      ...mailTemplate,
      data: { userName, link }
    });
    expect(result).to.be.an("object");
    expect(result.html).to.include(link);
    expect(result.html).to.include(userName);
  });

  it("gets priceRequestUpdateMail template", async function() {
    const mailTemplate = await DocTemplate.get({
      name: "priceRequestUpdateMail",
      accountId: "testId"
    });

    // debug({ mailTemplate });
    expect(mailTemplate).to.be.an("object");
    expect(mailTemplate.template).to.be.a("string");
    const values = getHBValues(mailTemplate.template);
    debug(JSON.stringify(values));
    expect(values).to.eql({
      id: "data-id",
      bidder: { name: "data-bidder,name" },
      logo: "data-logo",
      title: "data-title",
      to: { name: "data-to,name" },
      from: { accountName: "data-from,accountName", name: "data-from,name" },
      link: "data-link",
      overview: [
        {
          ts: "data-ts",
          shipmentLink: "data-shipmentLink",
          reference: "data-reference",
          kg: "data-kg",
          from: "data-from",
          to: "data-to",
          type: "data-type"
        }
      ]
    });
  });
});
