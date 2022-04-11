/* eslint-disable func-names */
import { expect } from "chai";

import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { priceRequestExpiredHook } from "/imports/api/notifications/server/hooks/price-request-expired.js";
import { PriceRequest } from "/imports/api/priceRequest/PriceRequest";

const debug = require("debug")("email:pr:expired");

let defaultMongo;

describe("email:price request", function() {
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
  it("expired", async function() {
    const PRICE_REQUEST_ID = "zgSR5RRWJoHMDSEDy";
    const priceRequest = await PriceRequest.first(PRICE_REQUEST_ID);
    expect(priceRequest).to.be.an("object");

    // update due date to past date (5 min ago)
    await PriceRequest._collection.update(
      { _id: priceRequest._id },
      { $set: { dueDate: new Date(Date.now() - 5 * 1000 * 60) } }
    );
    expect(priceRequest._id).to.be.an("string");

    const result = await priceRequestExpiredHook(PRICE_REQUEST_ID);
    expect(result.mails).to.equal(1);
    expect(result.sendResult.ok).to.equal(true);
    expect(result.sendResult.sendClass.input.subject).to.contain("has expired");
    expect(result.sendResult.sendClass.input.content.text).to.contain(
      "/price-request/zgSR5RRWJoHMDSEDy"
    );
    const mail = await result.sendResult.sendClass.buildAndSend();
    expect(mail.ok).to.equal(true);
  });
});
