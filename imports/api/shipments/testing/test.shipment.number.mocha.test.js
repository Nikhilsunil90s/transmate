/* eslint-disable func-names */
import { expect } from "chai";
import { generateUniqueNumber } from "/imports/utils/functions/generateUniqueNumber";
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb";
import { Shipment } from "/imports/api/shipments/Shipment";

const debug = require("debug")("shipment:getShipmentNumber:test");

let defaultMongo;
describe("shipment-getShipmentNumber", function() {
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
    const objects = [..."0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"].map(el => {
      return { number: `${el}` };
    });
    debug("instert start objects");
    await Shipment._collection.rawCollection().insertMany(objects);
  });

  it("get back valid number", async function() {
    // const shipmentId = "2jG2mZFcaFzqaThcr";
    // const number = "Q7SQYEPY";

    const result = await generateUniqueNumber();
    debug("getShipmentNumber %j", result);
    expect(result).to.be.a("string");
  });

  it("get error", async function() {
    if (process.env.DEFAULT_MONGO) defaultMongo.resetIds();

    let testError;
    try {
      const result = await generateUniqueNumber(1);
      debug("getShipmentNumber %j", result);
      expect(result).to.be.equal(null);
    } catch (error) {
      testError = error;
    }
    expect(testError).to.be.an("error");
  });

  // will not always work as it depends on the random to find the "A"
  it.skip("get back A", async function() {
    if (process.env.DEFAULT_MONGO) defaultMongo.resetIds();
    await Shipment._collection.rawCollection().deleteOne({ number: "A" });
    const result = await generateUniqueNumber(1);
    debug("getShipmentNumber %j", result);
    expect(result)
      .to.be.a("string")
      .to.equal("A");
  });
});
