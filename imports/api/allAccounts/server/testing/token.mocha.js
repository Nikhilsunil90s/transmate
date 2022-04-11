/* eslint-disable func-names */
import { expect } from "chai";
import fs from "fs";
import TokenGenerationService from "../tokenGeneationSrv.js";
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";

const debug = require("debug")("shipment:confirmRates:numidia");

let defaultMongo;

describe("token", function() {
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
  it("generate token", async function() {
    const priceRequestId = "zgSR5RRWJoHMDSEDy";
    const userId = "jsBor6o3uRBTFoRQY";
    const route = {
      page: "priceRequestEdit",
      _id: priceRequestId,
      section: "data"
    };
    const expiresIn = "1000d";

    const tokenString = await TokenGenerationService.generateToken(
      route,
      userId,
      "login-redirect",
      expiresIn
    );
    expect(tokenString).to.be.a("string");
    debug("test token %o", { route, userId, tokenString, expiresIn });
    await fs.writeFileSync(
      ".testing/cypress/fixtures/test-token.json",
      JSON.stringify({ route, userId, tokenString, expiresIn }),
      {
        encoding: "utf8",
        flag: "w"
      }
    );
  });
});
