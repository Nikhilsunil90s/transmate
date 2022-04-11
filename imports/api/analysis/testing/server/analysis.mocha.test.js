/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
import { expect } from "chai";
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection";
import { resolvers } from "../../apollo/resolvers";

const ACCOUNT_ID = "C11051";
const USER_ID = "pYFLYFDMJEnKADYXX";

let defaultMongo;
describe("analysis", function() {
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo");
      await defaultMongo.connect();
    }

    const resetDone = await resetDb({ resetUsers: true });
    if (!resetDone) throw Error("reset was not possible, test can not run!");
  });
  describe("create analysis", function() {
    beforeEach(function() {
      return resetCollections(["analysis"]);
    });
    const context = {
      accountId: ACCOUNT_ID,
      userId: USER_ID
    };
    it.skip("[create analysis type switchpoint]", async function() {
      const args = {
        input: {
          type: "switchPoint",
          name: "Bare analysis"
        }
      };
      const res = await resolvers.Mutation.createAnalysis(null, args, context);
      expect(res).to.not.equal(undefined);
      expect(res).to.be.a("string");
    });
    it.skip("[create analysis type simulation]", async function() {
      const args = {
        input: {
          type: "simulation",
          name: "Bare analysis"
        }
      };
      const res = await resolvers.Mutation.createAnalysis(null, args, context);
      expect(res).to.not.equal(undefined);
      expect(res).to.be.a("string");
    });
  });
});
