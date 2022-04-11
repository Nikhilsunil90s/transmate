/* eslint-disable func-names */
import { expect } from "chai";

import { calculateShipmentAndInvoiceTotal } from "../query.helpers.js";
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { Shipment } from "/imports/api/shipments/Shipment";

const debug = require("debug")("shipment:query:helper:test");

const SHIPMENT_ID_WITH_COSTS = "2jG2mZFcaFzqaThcr";

let defaultMongo;
describe("shipment-query helpers", function() {
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

  it("get calculateShipmentAndInvoiceTotal", async function() {
    const shipment = await Shipment.first(SHIPMENT_ID_WITH_COSTS);
    const result = await calculateShipmentAndInvoiceTotal({
      invoices: [],
      shipment
    }).get();
    debug("result data %o", result);
    expect(result.totalShipmentCosts).to.be.greaterThan(500);
    expect(result.totalInvoiceCosts).to.be.eql(0);
    expect(result.totalInvoiceDelta).to.be.greaterThan(500);
  });
});
