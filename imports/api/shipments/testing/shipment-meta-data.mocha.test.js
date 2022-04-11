/* eslint-disable func-names */
import { expect } from "chai";
import { getBidMetaData } from "../services/shipment-meta-data.js";
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";

import { Rate } from "/imports/api/rates/Rate.js";

const debug = require("debug")("shipment:meta-data:test");

let defaultMongo;
describe("shipment-meta", function() {
  before(async () => {
    debug("create mongo connections");
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../.testing/mocha/DefaultMongo.js");
      await defaultMongo.connect();
    }
    debug("dynamic import of resetdb");
    const resetDone = await resetDb({ resetUsers: true });
    if (!resetDone) throw Error("reset was not possible, test can not run!");

    // insert yesterdays rate for it to work
    const lastRate = await Rate.first();
    delete lastRate._id;
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
    lastRate.date = yesterday.toISOString().substring(0, 10);
    await Rate._collection.insert(lastRate);
  });

  it("get back bid data", async function() {
    const shipmentId = "2jG2mZFcaFzqaThcr";

    const result = await getBidMetaData(shipmentId);
    debug("getBidMetaData %j", result);
    expect(Math.round(result.amount)).to.equal(1170);
    expect(result.carrierName).to.be.a("string");
  });
});
