/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { expect } from "chai";

import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection.js";

// data
import { Shipment } from "/imports/api/shipments/Shipment";
import { simulationDoc } from "/imports/api/shipments/testing/server/shipmentRoadData";
import { priceRequestService } from "../../services/priceRequest";

const debug = require("debug")("priceRequestAnalysis:tests");

const PRICE_REQUEST_ID = "zgSR5RRWJoHMDSEDy";
const ACCOUNT_ID = "S65957";
const USER_ID = "jsBor6o3uRBTFoRQY";

let defaultMongo;
describe("priceRequestAnalyse", function() {
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo");
      await defaultMongo.connect();
    }

    const resetDone = await resetDb({ resetUsers: true });
    if (!resetDone) throw Error("reset was not possible, test can not run!");
  });

  describe("service", function() {
    const context = {
      accountId: ACCOUNT_ID,
      userId: USER_ID
    };
    beforeEach(async function() {
      await resetCollections(["priceRequests", "shipments"]);
      await Shipment._collection.update({}, { $set: simulationDoc });
      return true;
    });

    it("check if function to get similar data works (bq)", async function() {
      // . create price request from params

      const srv = priceRequestService(context);
      await srv.init({ priceRequestId: PRICE_REQUEST_ID });
      const { historicData } = await srv.addAnalyseDataBQ();

      // checks:
      // should return empty array
      expect(historicData).to.eql([]);
    });

    it("check if function to get simulationdata works", async function() {
      // 2. create price request from params
      const srv = priceRequestService(context);
      await srv.init({ priceRequestId: PRICE_REQUEST_ID });
      const { simulationData } = await srv.addAnalyseDataSimulations();

      // checks:
      // should return  array
      debug("simulationData", simulationData);
      expect(simulationData).to.be.an("array");
      expect(simulationData.length).to.be.greaterThan(0);
    });
    it("check if function to get analysis data works", async function() {
      // 2. create price request from params
      const srv = priceRequestService(context);
      await srv.init({ priceRequestId: PRICE_REQUEST_ID });
      const { analyseData } = await srv.getAnalyse();

      // checks:
      // should return  array
      debug("analyseData", analyseData);
      expect(analyseData).to.be.an("array");
      expect(analyseData.length).to.be.greaterThan(0);
    });
  });
});
