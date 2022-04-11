/* eslint-disable func-names */
import { expect } from "chai";

// import fs from "fs";

import { getShipmentChanges } from "../query.getShipmentChanges.js";
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { Shipment } from "/imports/api/shipments/Shipment";
import { changesTestData } from "/imports/api/shipments/services/testing/log-changes-test-data.js";

const debug = require("debug")("shipment:getShipmentChanges:test");

const testData = {
  accountId: "S65957",
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

    const rawDB = Shipment._collection.rawDatabase();
    debug("delete past logs");
    await rawDB.collection("logs.changes").remove();
    debug("insert logs");
    await rawDB.collection("logs.changes").insertMany(changesTestData);
  });

  it("get back changes", async function() {
    const result = await getShipmentChanges({
      accountId: testData.accountId
    }).get({ shipmentId: testData.shipmentId });
    debug("change data %o", result);
    expect(result.id).to.equal(testData.shipmentId);
    expect(result.changes).to.be.a("array");
    expect(result.changes[0].change).to.be.a("string");

    // await fs.writeFileSync(
    //   "./dump/log-changes-test-data-output.json",
    //   JSON.stringify(result),
    //   {
    //     encoding: "utf8",
    //     flag: "w"
    //   }
    // );
  });
});
