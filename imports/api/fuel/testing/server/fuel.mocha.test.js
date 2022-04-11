/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
import { Meteor } from "meteor/meteor";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection";
import { expect } from "chai";
import { resolvers } from "../../apollo/resolvers";
import { FuelIndex } from "../../FuelIndex";

// const debug = require("debug")("tenders:test");

const ACCOUNT_ID = "S65957";
const USER_ID = "jsBor6o3uRBTFoRQY";

const FUEL_INDEX_ID = "sscxbzwqdnHwPez5L";
const FUEL_INDEX_ID2 = "sscxbzwqdnHwPezXX";

let defaultMongo;
describe("fuel index", function() {
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo");
      await defaultMongo.connect();
    }

    const resetDone = await resetCollections([
      "accounts",
      "users",
      "roleAssingments"
    ]);
    if (!resetDone) throw Error("reset was not possible, test can not run!");
    Meteor.setUserId && Meteor.setUserId(USER_ID);
  });
  describe("resolvers", function() {
    const context = {
      userId: USER_ID,
      accountId: ACCOUNT_ID
    };
    beforeEach(function() {
      return resetCollections(["fuel"]);
    });
    it("[getFuelIndexes] gets for overview", async function() {
      const res = await resolvers.Query.getFuelIndexes(null, {}, context);

      expect(res).to.have.lengthOf(2);
      expect(res[0].name).to.not.equal(undefined);
      expect(res[0].base).to.not.equal(undefined);
    });
    it("[getFuelIndex] gets fuel index", async function() {
      const res = await resolvers.Query.getFuelIndex(
        null,
        { fuelIndexId: FUEL_INDEX_ID },
        context
      );

      expect(res).to.not.equal(undefined);
      expect(res.periods).to.not.equal(undefined);
    });
    it("[updateFuelIndex] updates my fuel index", async function() {
      const args = {
        input: {
          fuelIndexId: FUEL_INDEX_ID2,
          updates: {
            name: "TEST_NAME",
            periods: [
              { year: new Date().getFullYear(), month: 1, index: 7, fuel: 7 },
              { year: new Date().getFullYear(), month: 2, index: 7, fuel: 7 }
            ]
          }
        }
      };
      const res = await resolvers.Mutation.updateFuelIndex(null, args, context);

      expect(res).to.not.equal(undefined);
      expect(res.name).to.equal("TEST_NAME");
      expect(res.periods).to.be.an("array");
      expect(res.periods).to.have.lengthOf(2);
      expect(res.periods[0]).to.eql(args.input.updates.periods[0]);
    });
    it("[removeFuelIndex] removes index", async function() {
      const args = { fuelIndexId: FUEL_INDEX_ID };
      const res = await resolvers.Mutation.removeFuelIndex(null, args, context);

      expect(res).to.be.a("boolean");

      const test = await FuelIndex.first(FUEL_INDEX_ID);
      expect(!!test).to.equal(false);
    });
    it("[addFuelIndex] creates index", async function() {
      const args = {
        fuel: {
          name: "TEST_NAME",
          base: {
            month: 1,
            year: 2021,
            rate: 10
          },
          fuel: 10,
          acceptance: 8,
          description: "some text"
        }
      };
      const res = await resolvers.Mutation.addFuelIndex(null, args, context);
      expect(res).to.not.equal(null);
      expect(res.id).to.not.equal(undefined);
    });
  });
});
