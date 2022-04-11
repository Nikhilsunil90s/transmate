/* eslint-disable func-names */

import { expect } from "chai";
import { Shipment } from "/imports/api/shipments/Shipment.js";
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";

import { buildNestedItems } from "/imports/api/items/items-helper";

const debug = require("debug")("email:itemTable");

let defaultMongo;

describe("get items for pr email", function() {
  this.timeout(10000);
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo.js");
      await defaultMongo.connect();
    }
    debug("dynamic import of resetdb");
    await resetDb({ resetUsers: true });
  });

  it("nested items with 1 level", async function() {
    const shipment = await Shipment.first("2jG2mZFcaFzqaThcr");
    const items = buildNestedItems(await shipment.getNestedItems());

    // debug("items %j", items);
    expect(items).to.be.an("array");
    expect(items[0].references).to.eql({ document: "00-123098" });
    expect(items[0].quantity).to.eql({
      code: "ST",
      amount: 1,
      description: "Truck food grade"
    });

    expect(items[0].subItems[0]._id).to.eql("nEv5S78ZKHeo9q4mK");
  });
});
