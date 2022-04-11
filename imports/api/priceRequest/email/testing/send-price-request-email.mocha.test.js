/* eslint-disable func-names */
import { expect } from "chai";

import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { sendPriceRequestEmail } from "../price-request-email.js";
import { PriceRequest } from "/imports/api/priceRequest/PriceRequest";
import { User } from "/imports/api/users/User";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";

const debug = require("debug")("email:pr:requested");

let defaultMongo;
const originalTokenValue = process.env.JWT_SECRET;
describe("email:price request requested", function() {
  this.timeout(10000);
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo.js");
      await defaultMongo.connect();
    }
    debug("dynamic import of resetdb");
    await resetDb({ resetUsers: true });
  });
  before(function() {
    process.env.JWT_SECRET = "123456789123456789";
  });
  after(function() {
    process.env.JWT_SECRET = originalTokenValue;
  });
  it("requested", async function() {
    const PRICE_REQUEST_ID = "zgSR5RRWJoHMDSEDy";
    const BIDDER_ID = "C75701";
    const BIDDER_USER_ID = "pYFLYFDMJEnKADY3h";
    const priceRequest = await PriceRequest.first(PRICE_REQUEST_ID);
    expect(priceRequest).to.be.an("object");
    expect(priceRequest._id).to.be.an("string");
    const bidder = await AllAccounts.first(BIDDER_ID);

    const user = await User.profile(BIDDER_USER_ID);

    // check of model works
    expect(user.getName()).to.be.a("string");
    const result = await sendPriceRequestEmail({
      user,
      bidder,
      type: "request",
      accountId: priceRequest.customerId,
      accountName: "Test invite account",
      priceRequest
    });
    expect(result.ok).to.equal(true);

    // force send
    const mail = await result.sendClass.buildAndSend();
    expect(mail.ok).to.equal(true);
  });

  it("requested numidia", async function() {
    const PRICE_REQUEST_ID = "zgSR5RRWJoHMDSEDy";
    const BIDDER_ID = "C75701";
    const BIDDER_USER_ID = "pYFLYFDMJEnKADY3h";
    const priceRequest = await PriceRequest.findOne(PRICE_REQUEST_ID);
    expect(priceRequest).to.be.an("object");
    expect(priceRequest._id).to.be.an("string");
    const bidder = await AllAccounts.findOne(BIDDER_ID);

    const user = await User.findOne(BIDDER_USER_ID);

    // check of model works
    expect(user.getName()).to.be.a("string");
    let result = await sendPriceRequestEmail({
      user,
      bidder,
      type: "request",
      accountId: "S46614",
      accountName: "Test invite account",
      priceRequest
    });
    expect(result.ok).to.equal(true);
    result = await result.sendClass.getTemplate({});
    debug("with themplate %o", result);
    expect(result.template).to.be.an("string");
    result = await result.fillTemplate({});
    debug("with content %o", result);
    expect(result.input.content.html).to.be.an("string");

    // force send
    const mail = await result.buildAndSend();
    expect(mail.ok).to.equal(true);
  });
});
