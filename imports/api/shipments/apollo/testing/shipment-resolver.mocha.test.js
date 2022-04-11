/* eslint-disable func-names */
import { expect } from "chai";

import { resolvers } from "/imports/api/shipments/apollo/resolvers.js";
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";

const debug = require("debug")("shipment:query:helper:test");

const ACCOUNT_ID = "S65957";
const USER_ID = "jsBor6o3uRBTFoRQY";
const SHIPMENT_ID_WITH_COSTS = "2jG2mZFcaFzqaThcr";
const context = {
  userId: USER_ID,
  accountId: ACCOUNT_ID
};

let defaultMongo;
describe("shipment-resolvers", function() {
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
  describe("Query", function() {
    it("[getShipmentCostDetails] get result", async function() {
      const result = await resolvers.Query.getShipmentCostDetails(
        null,
        { shipmentId: SHIPMENT_ID_WITH_COSTS },
        context
      );
      debug("result data %o", result);
      expect(result).to.be.an("object");
      expect(result._id).to.equal(SHIPMENT_ID_WITH_COSTS);
      expect(result.costs).to.an("array");
    });

    it("[getShipmentInsights] get result", async function() {
      const result = await resolvers.Query.getShipmentInsights(
        null,
        { shipmentId: SHIPMENT_ID_WITH_COSTS },
        context
      );
      debug("result data %o", result);
      expect(result).to.be.an("object");
      expect(result.air).to.equal(undefined);
    });
  });
  describe("Mutation", function() {
    it("[approveDeclineShipmentCosts]", async function() {
      const result = await resolvers.Mutation.approveDeclineShipmentCosts(
        null,
        {
          input: {
            shipmentId: SHIPMENT_ID_WITH_COSTS,
            index: 2,
            action: "approve"
          }
        },
        context
      );
      debug("result data %o", result);
      expect(result).to.be.an("object");
      expect(result._id).to.equal(SHIPMENT_ID_WITH_COSTS);
      expect(result.costs).to.an("array");
    });
  });
});
