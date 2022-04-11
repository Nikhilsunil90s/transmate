/* eslint-disable func-names */
import { expect } from "chai";

// import fs from "fs";

import { getShipment } from "../query.getShipment.js";
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { getShipmentQueryResults } from "./shipment-test-data";

const debug = require("debug")("shipment:getShipment:test");

const testData = {
  accountId: "S65957",
  userrId: "jsBor6o3uRBTFoRQY",
  shipmentId: "2jG2mZFcaFzqaThcr"
};

let defaultMongo;
describe("shipment-getShipmentChanges", function() {
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

    // const rawDB = Shipment._collection.rawDatabase();
  });

  it("get back shipment", async function() {
    const result = await getShipment({
      accountId: testData.accountId,
      userId: testData.userId
    }).get({ shipmentId: testData.shipmentId });
    debug("shipment data %o", result.id);
    expect(result.id).to.equal(testData.shipmentId);
    const testObj = getShipmentQueryResults[testData.shipmentId];
    testObj.updated = result.updated;
    debug("updated %o vs %o", testObj.updated, result.updated);
    expect(result).to.deep.keys(testObj);
  });
});
