/* eslint-disable func-names */
import { expect } from "chai";
import { triggerWorkerJob } from "/imports/api/workers/services/triggerWorkerJob.js";

import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";

const debug = require("debug")("job:test");

let defaultMongo;
describe("triggerworker", function() {
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo");
      await defaultMongo.connect();
    }
    debug("dynamic import of resetdb");
    await resetDb({ resetUsers: true });
  });
  it("test trigger worker", async function() {
    const result = await triggerWorkerJob({
      event: "shipment-stage.released",
      accountId: "testAccountActions",
      userId: "testUserId",
      data: {
        shipmentId: "Liy2zt3cqqymTKtfj",
        accountId: "testAccountActions",
        userId: "testUserId"
      }
    }).go();
    debug("test trigger worker %o", result);
    expect(result.ok).to.equal(true);
    expect(result.actions.length).to.equal(1);
  });

  it("test numidia price confirm after stage release", async function() {
    const result = await triggerWorkerJob({
      event: "shipment-stage.released",
      accountId: "S46614",
      userId: "testUserId",
      data: {
        shipmentId: "TYqP9gRd3zXjgfBfm"
      }
    }).go();
    debug("test trigger worker %o", result);
    expect(result.ok).to.equal(true);
    expect(result.actions.length).to.equal(1);
  });
});
