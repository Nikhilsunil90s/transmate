/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection";
import { resolvers } from "../../apollo/resolvers";
import { expect } from "chai";

const ACCOUNT_ID = "S65957";
const USER_ID = "jsBor6o3uRBTFoRQY";
const ANALYSIS_ID = "Ac5HspYMWaM7PL3kP";
const PRICE_LIST_ID = "3ecjkjCcskEJph8W6";

let defaultMongo;
describe("analysis-switch-point", function() {
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo");
      await defaultMongo.connect();
    }

    const resetDone = await resetDb({ resetUsers: true });
    if (!resetDone) throw Error("reset was not possible, test can not run!");
  });
  describe("updateSwitchPoint", function() {
    beforeEach(function() {
      return resetCollections(["analysis", "switchPoint", "users", "accounts"]);
    });
    const context = {
      accountId: ACCOUNT_ID,
      userId: USER_ID
    };
    it("[updateSwitchPoint]", async function() {
      const args = {
        input: {
          analysisId: ANALYSIS_ID,
          update: {
            name: "Test2"
          }
        }
      };
      const res = await resolvers.Mutation.updateSwitchPoint(
        null,
        args,
        context
      );
      expect(res).to.not.equal(undefined);
      expect(res).to.be.an("object");
      expect(res.analysisId).to.equal(args.input.analysisId);
      expect(res.name).to.equal(args.input.update.name);
    });
  });
  describe("processSwitchPoint", function() {
    beforeEach(function() {
      return resetCollections(["analysis", "switchPoint", "users", "accounts"]);
    });
    const context = {
      accountId: ACCOUNT_ID,
      userId: USER_ID
    };
    it.skip("[processSwitchPoint]", async function() {
      // FIXME: processSwitchPoint method is not developed yet! modify the resolver
      const args = {
        analysisId: ANALYSIS_ID
      };
      const res = await resolvers.Mutation.processSwitchPoint(
        null,
        args,
        context
      );
      expect(res).to.not.equal(undefined);
      expect(res).to.be.an("object");
    });
  });
  describe("switchPointGenerateLanes", function() {
    beforeEach(function() {
      return resetCollections([
        "analysis",
        "analysisSimulation",
        "switchPoint",
        "users",
        "accounts"
      ]);
    });
    const context = {
      accountId: ACCOUNT_ID,
      userId: USER_ID
    };
    it("[switchPointGenerateLanes]", async function() {
      // note: you need a pricelist with lane definition from & to == zone
      const args = {
        input: {
          analysisId: ANALYSIS_ID,
          priceListId: PRICE_LIST_ID
        }
      };
      const res = await resolvers.Mutation.switchPointGenerateLanes(
        null,
        args,
        context
      );

      expect(res).to.not.equal(undefined);
      expect(res).to.be.an("object");
      expect(res.priceListIds[0]).to.equal(args.input.priceListId);
      expect(res.lanes).to.have.lengthOf(2);
    });
  });
});
