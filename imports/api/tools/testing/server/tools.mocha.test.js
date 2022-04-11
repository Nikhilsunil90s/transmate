import { Meteor } from "meteor/meteor";

import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection";
import { expect } from "chai";
import { resolvers } from "../../apollo/resolvers";

const ACCOUNT_ID = "S65957";
const USER_ID = "jsBor6o3uRBTFoRQY";

let defaultMongo;
describe("Tools", function() {
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
    it.skip("[getOceanDistance]", async function() {
      const args = {
        input: {
          from: "DE",
          to: "BE"
        }
      };
      const res = await resolvers.Mutation.getOceanDistance(
        null,
        args,
        context
      );
      expect(res).to.not.equal(undefined);
      expect(res).to.be.an("object");
      expect(res).to.have.property("km");
      expect(res).to.have.property("index");
      expect(res).to.have.property("lat");
      expect(res).to.have.property("lng");
      expect(res).to.have.property("port");
      expect(res).to.have.property("nm");
    });
  });
});
