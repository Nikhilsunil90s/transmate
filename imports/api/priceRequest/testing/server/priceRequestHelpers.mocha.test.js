/* eslint-disable no-underscore-dangle */
/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */
import { expect } from "chai";

// collections
import { PriceRequest } from "../../PriceRequest";
import { priceRequestHelpers } from "../../services/priceRequestHelpers";

import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";

const debug = require("debug")("price-request:helper:test");

let defaultMongo;
const PRICE_REQUEST_ID = "zgSR5RRWJoHMDSEDy"; // has a linked job
// user viewing ie jsBor6o3uRBTFoRQY needs role "core-priceRequest-see-tokens"

describe("PriceRequestHelper", function() {
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo");
      await defaultMongo.connect();
    }

    const resetDone = await resetDb({ resetUsers: true });
    if (!resetDone) throw Error("reset was not possible, test can not run!");
  });
  it("add tokens", async function() {
    const priceRequestId = PRICE_REQUEST_ID;
    let priceRequest = await PriceRequest.first(priceRequestId);
    priceRequest = await priceRequestHelpers.addTokens(priceRequest);
    debug("returned contact %o", priceRequest.bidders[0].contacts[0]);
    expect(priceRequest.bidders[0].contacts[0].token).to.eql(
      "https://test.transmate.eu/login-token/xtokenx"
    );
  });
});
