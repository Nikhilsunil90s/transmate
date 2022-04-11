/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection";
import { resolvers } from "../../apollo/resolvers";
import { expect } from "chai";

const ACCOUNT_ID = "S65957";
const USER_ID = "jsBor6o3uRBTFoRQY";
const ANALYSIS_ID = "cJn9oYi5YWx8t9fwQ";

let defaultMongo;
describe("analysis-simulation", function() {
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo");
      await defaultMongo.connect();
    }

    const resetDone = await resetDb({ resetUsers: true });
    if (!resetDone) throw Error("reset was not possible, test can not run!");
  });
  describe("simulationStart", function() {
    beforeEach(function() {
      return resetCollections([
        "analysis",
        "analysisSimulation",
        "users",
        "accounts"
      ]);
    });
    const context = {
      accountId: ACCOUNT_ID,
      userId: USER_ID
    };
    it("[simulationStart]", async function() {
      const args = {
        analysisId: ANALYSIS_ID
      };
      const res = await resolvers.Mutation.simulationStart(null, args, context);
      expect(res).to.not.equal(undefined);
      expect(res).to.be.an("object");
      expect(res.analysisId).to.equal(args.analysisId);
      expect(res.status).to.equal("running");
    });
  });
  describe("simulationSavePriceLists", function() {
    beforeEach(function() {
      return resetCollections([
        "analysis",
        "analysisSimulation",
        "users",
        "accounts"
      ]);
    });
    const context = {
      accountId: ACCOUNT_ID,
      userId: USER_ID
    };
    it.skip("[simulationSavePriceLists]", async function() {
      const args = {
        input: {
          analysisId: ANALYSIS_ID,
          priceLists: [
            {
              id: "sHvBSWd92ZFNWfj3Y",
              title: "Invacare Short Sea PT -> GB+IE",
              carrierId: "C113453",
              carrierName: "Dachser Spain",
              alias: "Current"
            }
          ]
        }
      };
      const res = await resolvers.Mutation.simulationSavePriceLists(
        null,
        args,
        context
      );
      expect(res).to.not.equal(undefined);
      expect(res).to.be.an("object");
      expect(res.analysisId).to.equal(args.input.analysisId);
    });
  });
  describe("simulationSaveDetail", function() {
    beforeEach(function() {
      return resetCollections([
        "analysis",
        "analysisSimulation",
        "users",
        "accounts"
      ]);
    });
    const context = {
      accountId: ACCOUNT_ID,
      userId: USER_ID
    };
    it.skip("[simulationSaveDetail]", async function() {
      const args = {
        analysisId: ANALYSIS_ID,
        updates: [
          {
            rowData: {
              quantity: 10,
              laneId: "LCHoEc",
              volumeRangeId: "2ypJrf",
              volumeGroupId: "uZhkc4",
              equipmentId: ""
            },
            update: {
              name: "Test analysis"
            }
          }
        ]
      };
      const res = await resolvers.Mutation.simulationSaveDetail(
        null,
        args,
        context
      );
      expect(res).to.not.equal(undefined);
      expect(res).to.be.an("boolean");
      expect(res).to.equal(true);
    });
  });
  describe("simulationSaveUpdate", function() {
    beforeEach(function() {
      return resetCollections([
        "analysis",
        "analysisSimulation",
        "users",
        "accounts"
      ]);
    });
    const context = {
      accountId: ACCOUNT_ID,
      userId: USER_ID
    };
    it.skip("[simulationSaveUpdate]", async function() {
      const args = {
        input: {
          analysisId: "HA9jM7Eqo4KWLDBne",
          update: {
            name: "Test analysis"
          }
        }
      };
      const res = await resolvers.Mutation.simulationSaveUpdate(
        null,
        args,
        context
      );
      expect(res).to.not.equal(undefined);
      expect(res).to.be.a("string");
    });
  });
  describe("simulationNextStep", function() {
    beforeEach(function() {
      return resetCollections([
        "analysis",
        "analysisSimulation",
        "users",
        "accounts"
      ]);
    });
    const context = {
      accountId: ACCOUNT_ID,
      userId: USER_ID
    };
    it.skip("[simulationNextStep]", async function() {
      const args = {
        analysisId: ANALYSIS_ID,
        nextStep: "options"
      };
      const res = await resolvers.Mutation.simulationNextStep(
        null,
        args,
        context
      );
      expect(res).to.not.equal(undefined);
      expect(res).to.be.a("string");
    });
  });
});
