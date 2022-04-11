/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */

import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { setupIndexes } from "/imports/startup/server/meteorStartup/indexes.js";
import { expect } from "chai";
import { performSearch } from "../queries";

const debug = require("debug")("search:test");

const ACCOUNT_ID = "S65957";
const USER_ID = "jsBor6o3uRBTFoRQY";

let defaultMongo;
describe("search", function() {
  // let db;
  // let indexFn = "createIndexes";
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo");
      // eslint-disable-next-line
      await defaultMongo.connect();
    }

    let resetDone;
    try {
      resetDone = await resetDb({ resetUsers: true });
      await setupIndexes();
    } catch (error) {
      console.error("RESET ERR", error);
    }
    if (!resetDone) throw Error("reset was not possible, test can not run!");
  });

  it("perform search", async function() {
    const res = await performSearch(
      { query: "Globex" },
      { accountId: ACCOUNT_ID, userId: USER_ID }
    );
    debug("search result %o", res);
    expect(res).to.be.an("object");
    expect(res.addresses.results)
      .to.be.an("array")
      .to.have.length(5);
    expect(res.priceList.results)
      .to.be.an("array")
      .to.have.length(1);
    expect(res.shipments.results)
      .to.be.an("array")
      .to.have.length(5);
  });
});
