/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
import { Meteor } from "meteor/meteor";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection";
import { expect } from "chai";
import { resolvers } from "../../apollo/resolvers";

import { PriceList } from "/imports/api/pricelists/PriceList";
import { PriceListRate } from "/imports/api/pricelists/PriceListRate";
import {
  generateGridupdateInputData,
  generateGridupdateInputDataForExisting
} from "./priceListUpdateGridData";

// const debug = require("debug")("tenders:test");

const ACCOUNT_ID = "S65957";
const USER_ID = "jsBor6o3uRBTFoRQY";
const PRICE_LIST_ID = "n8pYLq3LEzZDHqYS4";
const PRICE_LIST_ID2 = "3ecjkjCcskEJph8W6";

describe("priceList", function() {
  let defaultMongo;
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
      accountId: ACCOUNT_ID,
      userId: USER_ID
    };
    beforeEach(async function() {
      await resetCollections(["priceLists", "priceListRates"]);
    });
    it("[updatePriceListConversions] allows updating", async function() {
      await PriceList._collection.update(
        { _id: PRICE_LIST_ID },
        { $set: { status: "draft" } }
      );
      const args = {
        input: {
          priceListId: PRICE_LIST_ID,
          conversions: [
            {
              from: {
                uom: "kg"
              },
              to: {
                multiplier: 1750,
                uom: "pal",
                min: 100,
                max: 24000
              }
            }
          ]
        }
      };
      const updatedPriceListDoc = await resolvers.Mutation.updatePriceListConversions(
        null,
        args,
        context
      );

      expect(updatedPriceListDoc).to.not.equal(undefined);
      expect(updatedPriceListDoc.uoms).to.not.equal(undefined);
      expect(updatedPriceListDoc.uoms.conversions).to.eql(
        args.input.conversions
      );

      expect(updatedPriceListDoc.uoms.allowed).to.eql(["pal", "kg"]);
    });
    it("[updatePriceListRatesGrid][upserting] allows updating grid data", async function() {
      await PriceList._collection.update(
        { _id: PRICE_LIST_ID },
        { $set: { status: "draft" } }
      );
      const args = generateGridupdateInputData({
        priceListId: PRICE_LIST_ID,
        count: 2
      });
      const {
        results,
        errors
      } = await resolvers.Mutation.updatePriceListRatesGrid(
        null,
        args,
        context
      );

      expect(results.cellUpdate.nUpserted).to.equal(2);
      expect(errors.cellUpdate).to.equal(undefined);

      // testing the inserted docs:
      const rates = await PriceListRate.where({
        priceListId: PRICE_LIST_ID,
        laneId: {
          $in: args.updates.map(({ selector: { laneId } }) => laneId)
        }
      });

      expect(rates).to.have.lengthOf(2);
      rates.forEach(rateDoc => {
        expect(rateDoc.meta.source).to.equal("table");
        expect(rateDoc.rules).to.have.lengthOf(3);
        expect(rateDoc.amount.value).to.equal(10000);
      });
    });
    it("[updatePriceListRatesGrid][updating] allows updating grid data", async function() {
      await PriceList._collection.update(
        { _id: PRICE_LIST_ID2 },
        { $set: { status: "draft" } }
      );
      const existingRateDoc = await PriceListRate.first({
        priceListId: PRICE_LIST_ID2,
        "rules.volumeGroupId": { $exists: true }
      });
      const args = generateGridupdateInputDataForExisting({
        rate: existingRateDoc
      });

      const {
        results,
        errors
      } = await resolvers.Mutation.updatePriceListRatesGrid(
        null,
        args,
        context
      );

      expect(results.cellUpdate.nUpserted).to.equal(0);
      expect(results.cellUpdate.nModified).to.equal(1);
      expect(errors.cellUpdate).to.equal(undefined);

      // testing the inserted docs:
      const rates = await PriceListRate.where({
        priceListId: PRICE_LIST_ID2,
        ...Object.entries(args.updates[0].selector.rules).reduce(
          (acc, [k, v]) => {
            acc[`rules.${k}`] = v;
            return acc;
          },
          {}
        )
      });

      expect(rates).to.have.lengthOf(1);
      rates.forEach(rateDoc => {
        expect(rateDoc.meta.source).to.equal("table");
        expect(rateDoc.rules).to.have.lengthOf(3);
        expect(rateDoc.amount.value).to.equal(10000);
      });
    });
    it("[updatePriceListRatesGrid][removing] allows updating grid data", async function() {
      await PriceList._collection.update(
        { _id: PRICE_LIST_ID2 },
        { $set: { status: "draft" } }
      );
      const existingRateDoc = await PriceListRate.first({
        priceListId: PRICE_LIST_ID2,
        "rules.volumeGroupId": { $exists: true }
      });
      const args = generateGridupdateInputDataForExisting({
        rate: existingRateDoc
      });

      // empty update === removing the cell
      args.updates[0].update = null;

      const {
        results,
        errors
      } = await resolvers.Mutation.updatePriceListRatesGrid(
        null,
        args,
        context
      );

      expect(results.cellUpdate.nUpserted).to.equal(0);
      expect(results.cellUpdate.nModified).to.equal(0);
      expect(results.cellUpdate.nRemoved).to.equal(1);
      expect(errors.cellUpdate).to.equal(undefined);

      // testing the inserted docs:
      const rates = await PriceListRate.where({
        priceListId: PRICE_LIST_ID2,
        ...Object.entries(args.updates[0].selector.rules).reduce(
          (acc, [k, v]) => {
            acc[`rules.${k}`] = v;
            return acc;
          },
          {}
        )
      });

      expect(rates).to.have.lengthOf(0);
    });
  });
});
