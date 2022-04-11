/* eslint-disable func-names */
import { expect } from "chai";
import { NumidiaPriceSelect } from "../../../../../workers/customer-specific/numidia-confirm-selected-rate.js";

import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";

const debug = require("debug")("shipment:confirmRates:numidia");
const defaultMongo = require("../../../../../../../.testing/mocha/DefaultMongo.js");

describe("confirm cost to numidia", function() {
  before(async () => {
    debug("create mongo connections");
    await defaultMongo.connect();
    debug("dynamic import of resetdb");
    await resetDb({ resetUsers: true });
  });
  it("recalculate cost and confirm", async function() {
    try {
      await new NumidiaPriceSelect({
        shipmentId: "Liy2zt3cqqymTKtfj"
      }).send();
    } catch (e) {
      expect(e.message).to.contain(" edi account not found!");
    }
  });
});
