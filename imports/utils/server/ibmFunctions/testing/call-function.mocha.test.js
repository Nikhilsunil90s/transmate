/* eslint-disable func-names */
import { expect } from "chai";
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { callCloudFunction } from "../callFunction";

const debug = require("debug")("cloudFunction:test");

const ACCOUNT_ID = "S65957";
const USER_ID = "jsBor6o3uRBTFoRQY";
const context = {
  userId: USER_ID,
  accountId: ACCOUNT_ID
};

let defaultMongo;
describe("cloudfunction", function() {
  before(async () => {
    debug("create mongo connections");
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo.js");
      await defaultMongo.connect();
    }
    debug("dynamic import of resetdb");
    const resetDone = await resetDb({ resetUsers: true });
    if (!resetDone) throw Error("reset was not possible, test can not run!");
  });

  describe("call cloud function", function() {
    it("[generateDoc] get result", async function() {
      const result = await callCloudFunction(
        "generateDoc",
        {
          template: Buffer.from("{{data}}").toString("base64"),
          templateData: { data: "a" }
        },
        context
      );

      debug("result data %o", result);
      expect(result).to.be.an("object");
      expect(result).to.not.equal(undefined);
    });
  });
});
