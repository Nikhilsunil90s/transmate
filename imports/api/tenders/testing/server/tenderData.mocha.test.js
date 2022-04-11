/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
import { Meteor } from "meteor/meteor";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection";
import { expect } from "chai";
import { resolvers } from "../../apollo/resolvers";

import { TenderDetail } from "../../TenderDetail";

const OWNER_ACCOUNT_ID = "S65957";
const TENDER_OWNER_ID = "jsBor6o3uRBTFoRQY";
const USER_ID = TENDER_OWNER_ID;
const TENDER_ID = "zx43GEoqXk66umzNS";

let defaultMongo;
describe("tender-data", function() {
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo");
      await defaultMongo.connect();
    }

    const resetDone = await resetCollections([
      "users",
      "roles",
      "roleAssingments",
      "tenders",
      "tenderDetails"
    ]);
    if (!resetDone) throw Error("reset was not possible, test can not run!");
    Meteor.setUserId && Meteor.setUserId(USER_ID);
  });
  describe("resolvers", function() {
    const context = {
      userId: USER_ID,
      accountId: OWNER_ACCOUNT_ID
    };
    beforeEach(async function() {
      const resetDone = await resetCollections(["tenders", "tenderDetails"]);
      return resetDone;
    });

    it("[saveTenderDetails] upserts an entry in the details collection if nothing is present", async function() {
      const TEST_LANE_ID = "LCHoEc";
      const TEST_VOL_GRP_ID = "uZhkc4";
      const TEST_VOL_RNG_ID = "uMMu4W";
      const args = {
        input: [
          {
            item: {
              tenderId: TENDER_ID,
              name: "generated name here...",
              laneId: TEST_LANE_ID,
              volumeGroupId: TEST_VOL_GRP_ID,
              volumeRangeId: TEST_VOL_RNG_ID,
              goodsDG: false,
              equipmentId: null
            },
            update: { amount: 100, count: 120, leadTime: 20, currentCost: 1200 }
          }
        ]
      };
      await resolvers.Mutation.saveTenderDetails(null, args, context);
      const itemsForTender = await TenderDetail.where({
        tenderId: TENDER_ID,
        laneId: TEST_LANE_ID,
        volumeGroupId: TEST_VOL_GRP_ID,
        volumeRangeId: TEST_VOL_RNG_ID,
        goodsDG: false
      });

      expect(itemsForTender).to.be.an("array");
      expect(itemsForTender).to.have.lengthOf(1);
      expect(itemsForTender[0].quantity.count).to.equal(120);
      expect(itemsForTender[0].quantity.amount).to.equal(100);
      expect(itemsForTender[0].quantity.currentCost).to.equal(1200);
      expect(itemsForTender[0].quantity.leadTime).to.equal(20);
    });
  });
});
