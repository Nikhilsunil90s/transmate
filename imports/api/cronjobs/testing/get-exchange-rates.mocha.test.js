/* eslint-disable func-names */
import { expect } from "chai";
import {
  getMissingRateDates,
  fixMissingRates
} from "/imports/api/cronjobs/get-exchange-rates.js";
import { getRateForDate } from "/imports/api/rates/openexchange-rates.js";
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";

const debug = require("debug")("rates:test");

describe.skip("get-exchange-rates", function() {
  // only do this if you are chaning as this will call the openexchange api
  let defaultMongo;
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../.testing/mocha/DefaultMongo.js");
      await defaultMongo.connect();
    }

    debug("dynamic import of resetdb");
    await resetDb({ resetUsers: true });
  });
  it("get missing dates", async function() {
    debug("get missing 10 dates...");
    const result = await getMissingRateDates(10);
    debug("missing dates %o", result);
    expect(result).to.be.a("array");
    expect(result.length).to.be.greaterThan(5);
  });

  // FIXME: keep this?
  it.skip("get rate for date", async function() {
    const date = "2020-12-01";
    const result = await getRateForDate(date);
    debug("rate %o", result.date);
    expect(result).to.be.a("object");
    expect(result.date).to.equal(date);
    expect(result.rates).to.be.a("object");
  });
  it("all", async function() {
    const result = [];
    await fixMissingRates(2, result);
    debug("all %o", result);
    expect(result).to.be.a("array");
  });

  it("second time no update needed", async function() {
    const result = [];
    await fixMissingRates(2, result);
    debug("all second time %o", result);
    expect(result).to.be.a("array");
  });
});
