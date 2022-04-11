import { Meteor } from "meteor/meteor";

import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection";
import { expect } from "chai";
import { resolvers } from "../../apollo/resolvers";

const ACCOUNT_ID = "S65957";
const USER_ID = "jsBor6o3uRBTFoRQY";
const WORK_FLOW_ID = "ObjectId";

let defaultMongo;
describe("fuel", function() {
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo");
      await defaultMongo.connect();
    }

    const resetDone = await resetDb({ resetUsers: true });
    if (!resetDone) throw Error("reset was not possible, test can not run!");
    // eslint-disable-next-line no-unused-expressions
    Meteor.setUserId && Meteor.setUserId(USER_ID);
  });
  describe("resolvers", function() {
    const context = {
      accountId: ACCOUNT_ID,
      userId: USER_ID
    };
    beforeEach(function() {
      return resetCollections(["fuel", "addresses", "users"]);
    });
    it.skip("[deleteWorkflow]", async function() {
      const args = {
        fuelIndexId: WORK_FLOW_ID
      };
      const res = await resolvers.Mutation.deleteWorkflow(null, args, context);
      expect(res).to.not.equal(undefined);
      expect(res).to.be.a("boolean");
      expect(res).to.equal(true);
    });
  });
});
