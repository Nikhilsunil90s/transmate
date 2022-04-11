/* eslint-disable func-names, prefer-arrow-callback */
// import moment from "moment";
// import { Random } from "/imports/utils/functions/random.js";
import { expect } from "chai";

// import sinon from "sinon";
// import { JobManager } from "/imports/utils/server/job-manager.js";

// import { AllAccounts } from "../../../allAccounts/AllAccounts";
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";

import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection.js";
import { resolvers } from "../../apollo/resolvers";

const ACCOUNT_ID = "S65957";
const USER_ID = "jsBor6o3uRBTFoRQY";

const PRICE_LIST_ID = "KYTm5EENCghCCQxpZ";

let defaultMongo;
describe("priceList", function() {
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo");
      await defaultMongo.connect();
    }

    const resetDone = await resetDb({ resetUsers: true });
    if (!resetDone) throw Error("reset was not possible, test can not run!");
  });
  describe("update PriceList", function() {
    const context = {
      accountId: ACCOUNT_ID,
      userId: USER_ID
    };
    beforeEach(async function() {
      await resetCollections(["priceLists"]);
      return true;
    });
    it("throws an error when not logged in", async function() {
      let result;
      try {
        result = await resolvers.Mutation.updatePriceList(null, {}, {});
      } catch (error) {
        result = error;
      }
      expect(result).to.be.an("error");
    });
    it.skip("[updatePriceList] update priceList", async function() {
      const args = {
        input: {
          priceListId: PRICE_LIST_ID,
          updates: {
            type: "contract"
          }
        }
      };
      const res = await resolvers.Mutation.updatePriceList(null, args, context);
      expect(res).to.not.equal(undefined);
    });
  });
});
