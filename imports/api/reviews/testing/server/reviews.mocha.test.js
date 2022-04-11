/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection";
import { resolvers } from "../../apollo/resolvers";
import { expect } from "chai";

const ACCOUNT_ID = "S65957";
const USER_ID = "jsBor6o3uRBTFoRQY";
const PARTNER_ID = "C75701";

let defaultMongo;
describe("reviews", function() {
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo");
      await defaultMongo.connect();
    }

    const resetDone = await resetDb({ resetUsers: true });
    if (!resetDone) throw Error("reset was not possible, test can not run!");
  });
  describe("addPartnerReview", function() {
    beforeEach(function() {
      return resetCollections(["users", "accounts", "rates"]);
    });
    const context = {
      accountId: ACCOUNT_ID,
      userId: USER_ID
    };
    it.skip("[addPartnerReview]", async function() {
      const args = {
        partnerId: PARTNER_ID
      };
      const res = await resolvers.Mutation.addPartnerReview(
        null,
        args,
        context
      );
      expect(res).to.not.equal(undefined);
      expect(res).to.be.a("string");
    });
  });
});
