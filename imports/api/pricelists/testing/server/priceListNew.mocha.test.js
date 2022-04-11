/* eslint-disable no-underscore-dangle */
/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */
import { expect } from "chai";

// collections
import { PriceList } from "/imports/api/pricelists/PriceList";
import { PriceListRate } from "/imports/api/pricelists/PriceListRate";

import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { resolvers } from "../../apollo/resolvers";

// data:
import { generateDataRoad, generateDataForm } from "./priceListTestData";
import { generateRateDataForPriceListAsync } from "./priceListRateTestData";
import { flattenRules } from "/imports/utils/priceList/grid_getData";
import {
  charges as chargesUpdate,
  lanes as lanesUpdate,
  volumes as volumesUpdate,
  equipments as equipmentsUpdate
} from "./priceListUpdateData";
import { generateAttachmentData } from "/imports/api/pricelists/testing/server/attachmentTestData";

import { LaneDefinitionSchema } from "../../../_jsonSchemas/simple-schemas/_utilities/priceListLaneDefinition";
import { VolumeDefinitionSchema } from "../../../_jsonSchemas/simple-schemas/_utilities/priceListVolumeDefinition";

const ACCOUNT_ID = "S65957";
const USER_ID = "jsBor6o3uRBTFoRQY";
const CARRIER_ID = "C11051";

let defaultMongo;
describe("PriceList", function() {
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo");
      await defaultMongo.connect();
    }

    const resetDone = await resetDb({ resetUsers: true });
    if (!resetDone) throw Error("reset was not possible, test can not run!");
  });
  describe("grid update", function() {
    const accountId = ACCOUNT_ID;
    const userId = USER_ID;
    const context = { accountId, userId };
    const carrierId = CARRIER_ID;
    let priceList;
    let priceListId;
    beforeEach(async function() {
      await PriceList._collection.remove({});
      await PriceListRate._collection.remove({});
      priceListId = await PriceList._collection.insert({
        ...generateDataRoad({ accountId, carrierId }),
        status: "draft"
      }); // returns id

      priceList = await PriceList.first(priceListId);

      // to be sure :
      expect(priceList).to.be.an("object");
    });
    it("[owner]updates an empty cell", async function() {
      const update = {
        amount: { unit: "EUR", value: 149.4 },
        comment: "Base rate",
        costId: "o6fLThAWhaWW3uDaj",
        priceListId,
        meta: { source: "table" },
        multiplier: "shipment",
        name: "Base rate",
        rules: [
          { laneId: "nhjFC6" },
          { volumeGroupId: "nDdTA8" },
          { volumeRangeId: "Yvwuew" }
        ],
        type: "calculated",
        laneId: "nhjFC6"
      };

      const {
        results,
        errors = {}
      } = await resolvers.Mutation.updatePriceListRatesGrid(
        null,
        {
          priceListId,
          updates: [
            {
              selector: {},
              update
            }
          ]
        },
        context
      );

      expect(results.cellUpdate.ok).to.equal(1);
      expect(results.cellUpdate.nUpserted).to.equal(1);
      expect(errors.cellUpdate).to.equal(undefined);
      expect(errors.headerUpdate).to.equal(undefined);

      const { _id, ...updatedRate } =
        (await PriceListRate._collection.findOne({ priceListId })) || {};
      expect(updatedRate).to.eql(update);
    });
    it("[owner]removes a rate from a cell", async function() {
      // rate object available:
      await generateRateDataForPriceListAsync({ priceList });
      const rate = await PriceListRate.first(
        { priceListId },
        { fields: { rules: 1, rulesUI: 1 } }
      );

      const { rules, rulesUI } = rate;

      // rules from array to object
      const selector = { rules: flattenRules({ rules }), rulesUI };

      const { results } = await resolvers.Mutation.updatePriceListRatesGrid(
        null,
        {
          priceListId,
          updates: [
            {
              selector,
              update: null
            }
          ]
        },
        context
      );

      expect(results.cellUpdate.ok).to.equal(
        1,
        `results: ${JSON.stringify(results)}`
      );
      expect(results.cellUpdate.nRemoved).to.equal(
        1,
        `results: ${JSON.stringify(results)}`
      );

      const noDoc = await PriceListRate.first({ priceListId });
      expect(!!noDoc).to.equal(false, "should have been removed");
    });
    it("[owner]updates a rate for an existing cell", async function() {
      // rate object available:
      await generateRateDataForPriceListAsync({ priceList });
      const { rules, rulesUI } = await PriceListRate.first(
        { priceListId },
        { fields: { rules: 1, rulesUI: 1 } }
      );

      // rules from array to object
      const selector = { rules: flattenRules({ rules }), rulesUI };

      const update = { amount: { value: 100, unit: "USD" } };

      const { results } = await resolvers.Mutation.updatePriceListRatesGrid(
        null,
        {
          priceListId,
          updates: [
            {
              selector,
              update
            }
          ]
        },
        context
      );

      expect(results.cellUpdate.ok).to.equal(1);
      expect(results.cellUpdate.nModified).to.equal(1);

      const priceListRateDoc = await PriceListRate.first({ priceListId });
      expect(priceListRateDoc.amount).to.eql(update.amount);
    });
    it("[bidder]updates an empty cell", async function() {
      await PriceList._collection.update(
        { _id: priceListId },
        { $set: { status: "requested", carrierId } }
      );
      const update = {
        amount: { unit: "EUR", value: 149.4 },
        comment: "Base rate",
        costId: "o6fLThAWhaWW3uDaj",
        priceListId,
        meta: { source: "table" },
        multiplier: "shipment",
        name: "Base rate",
        rules: [
          { laneId: "nhjFC6" },
          { volumeGroupId: "nDdTA8" },
          { volumeRangeId: "Yvwuew" }
        ],
        type: "calculated",
        laneId: "nhjFC6"
      };
      const { results } = await resolvers.Mutation.updatePriceListRatesGrid(
        null,
        {
          priceListId,
          updates: [
            {
              selector: {},
              update
            }
          ]
        },
        context
      );
      expect(results.cellUpdate.ok).to.equal(1);
      expect(results.cellUpdate.nUpserted).to.equal(1);

      const { _id, ...updatedRate } =
        (await PriceListRate._collection.findOne({
          priceListId
        })) || {};
      expect(updatedRate).to.eql(update);
    });
    it("[bidder]removes a rate from a cell", async function() {
      // set status right
      await PriceList._collection.update(
        { _id: priceListId },
        { $set: { status: "requested", carrierId } }
      );

      // rate object available:
      await generateRateDataForPriceListAsync({ priceList });
      const { rules, rulesUI } = await PriceListRate.first(
        { priceListId },
        { fields: { rules: 1, rulesUI: 1 } }
      );

      // rules from array to object
      const selector = { rules: flattenRules({ rules }), rulesUI };

      const { results } = await resolvers.Mutation.updatePriceListRatesGrid(
        null,
        {
          priceListId,
          updates: [
            {
              selector,
              update: undefined
            }
          ]
        },
        context
      );

      expect(results.cellUpdate.ok).to.equal(
        1,
        `results: ${JSON.stringify(results)}`
      );
      expect(results.cellUpdate.nRemoved).to.equal(
        1,
        `results: ${JSON.stringify(results)}`
      );

      const noDoc = await PriceListRate.first({ priceListId });
      expect(!!noDoc).to.equal(false, "should have been removed");
    });
    it("[bidder]updates a rate for an existing cell", async function() {
      // set status right
      await PriceList._collection.update(
        { _id: priceListId },
        { $set: { status: "requested", carrierId } }
      );

      // rate object available:
      await generateRateDataForPriceListAsync({ priceList });
      const { rules, rulesUI } = await PriceListRate.first(
        { priceListId },
        { fields: { rules: 1, rulesUI: 1 } }
      );

      // rules from array to object
      const selector = { rules: flattenRules({ rules }), rulesUI };

      const update = { amount: { value: 100, unit: "USD" } };
      const { results } = await resolvers.Mutation.updatePriceListRatesGrid(
        null,
        {
          priceListId,
          updates: [
            {
              selector,
              update
            }
          ]
        },
        context
      );

      expect(results.cellUpdate.ok).to.equal(
        1,
        `results: ${JSON.stringify(results)}`
      );
      expect(results.cellUpdate.nModified).to.equal(
        1,
        `results: ${JSON.stringify(results)}`
      );

      const priceListRateDoc = await PriceListRate.first({ priceListId });
      expect(priceListRateDoc.amount).to.eql(update.amount);
    });
  });
  describe("create", function() {
    const accountId = ACCOUNT_ID;
    const userId = USER_ID;
    const context = { accountId, userId };
    const carrierId = CARRIER_ID;
    beforeEach(async function() {
      await PriceList._collection.remove({});
      await PriceListRate._collection.remove({});
    });
    it("throws an error when not logged in", async function() {
      let errorTest;
      try {
        await resolvers.Mutation.createPriceList(null, { input: {} }, {});
      } catch (error) {
        errorTest = error;
      }
      expect(errorTest).to.be.an("error");
      expect(errorTest.message).to.match(/not-authorized/);
    });
    it("creates a new pricelist from the parameters", async function() {
      const input = generateDataForm({ accountId, carrierId });
      const res = await resolvers.Mutation.createPriceList(
        null,
        { input },
        context
      );
      expect(res).to.be.an("object");
      expect(res.id).to.not.equal(undefined);
    });
  });
  describe("updates", function() {
    const accountId = ACCOUNT_ID;
    const userId = USER_ID;
    const carrierId = CARRIER_ID;
    const context = { accountId, userId };
    let priceListId;
    beforeEach(async function() {
      await PriceList._collection.remove({});
      await PriceListRate._collection.remove({});
      priceListId = await PriceList._collection.insert({
        ...generateDataRoad({ accountId, carrierId }),
        status: "draft"
      }); // returns id
    });
    it("updates charges", async function() {
      const input = { priceListId, updates: { charges: chargesUpdate } };
      await resolvers.Mutation.updatePriceList(null, { input }, context);

      const priceListMod = await PriceList.first(priceListId);
      expect(priceListMod.charges).to.eql(chargesUpdate);
    });
    it("updates lanes", async function() {
      const input = { priceListId, updates: { lanes: lanesUpdate } };
      await resolvers.Mutation.updatePriceList(null, { input }, context);

      const priceListMod = await PriceList.first(priceListId);

      const cleanUpdate = lanesUpdate.map(laneItem =>
        LaneDefinitionSchema.clean(laneItem)
      );
      expect(priceListMod.lanes).to.eql(cleanUpdate);
    });
    it("updates volumes", async function() {
      const input = { priceListId, updates: { volumes: volumesUpdate } };
      await resolvers.Mutation.updatePriceList(null, { input }, context);

      const priceListMod = await PriceList.first(priceListId);

      const cleanUpdate = volumesUpdate.map(volumeItem =>
        VolumeDefinitionSchema.clean(volumeItem)
      );

      expect(priceListMod.volumes).to.eql(cleanUpdate);
    });
    it("updates equipments", async function() {
      const input = { priceListId, updates: { equipments: equipmentsUpdate } };
      await resolvers.Mutation.updatePriceList(null, { input }, context);

      const priceListMod = await PriceList.first(priceListId);

      expect(priceListMod.equipments).to.eql(equipmentsUpdate);
    });
    it("updates general data", async function() {
      const input = { priceListId, updates: { title: "test" } };
      await resolvers.Mutation.updatePriceList(null, { input }, context);

      const priceListMod = await PriceList.first(priceListId);

      Object.keys(input.updates).forEach(k => {
        expect(priceListMod[k]).to.eql(input.updates[k]);
      });
    });
  });
  describe("duplicate", function() {
    const accountId = ACCOUNT_ID;
    const userId = USER_ID;
    const carrierId = CARRIER_ID;
    const context = { accountId, userId };
    let priceListId;
    beforeEach(async function() {
      await PriceList._collection.remove({});
      await PriceListRate._collection.remove({});
      priceListId = await PriceList._collection.insert({
        ...generateDataRoad({ accountId, carrierId }),
        status: "draft"
      }); // returns id
    });
    it("throws an error when not logged in", async function() {
      let errorTest;
      try {
        await resolvers.Mutation.duplicatePriceList(null, { input: {} }, {});
      } catch (error) {
        errorTest = error;
      }
      expect(errorTest).to.be.an("error");
      expect(errorTest.message).to.match(/not-authorized/);
    });
    it("creates a duplicate of the referenced price list (structure only)", async function() {
      const input = { priceListId, rates: false };
      const newPriceListObj = await resolvers.Mutation.duplicatePriceList(
        null,
        { input },
        context
      );

      expect(newPriceListObj).to.be.an("object");

      // check some fields (e.g. lanes & volumes)
      expect(newPriceListObj.lanes[0]).to.not.equal(undefined);
      expect(newPriceListObj.volumes[0]).to.not.equal(undefined);
    });
    it("creates a duplicate of the referenced price list (with rates)", async function() {
      const priceList = await PriceList.first(priceListId);
      await generateRateDataForPriceListAsync({ priceList });
      const countOrgRates = await PriceListRate.count({ priceListId });

      expect(countOrgRates).to.be.above(0);

      const input = { priceListId, rates: true };
      const newPriceListObj = await resolvers.Mutation.duplicatePriceList(
        null,
        { input },
        context
      );

      expect(newPriceListObj).to.be.an("object");

      // check some fields (e.g. lanes & volumes)
      expect(newPriceListObj.lanes[0]).to.not.equal(undefined);
      expect(newPriceListObj.volumes[0]).to.not.equal(undefined);

      const countNewRates = await PriceListRate.count({
        priceListId: newPriceListObj.id
      });
      expect(countOrgRates).to.equal(countNewRates);
    });
  });
  describe("add-attachment", function() {
    const accountId = ACCOUNT_ID;
    const userId = USER_ID;
    const carrierId = CARRIER_ID;
    const context = { accountId, userId };
    let priceListId;
    beforeEach(async function() {
      await PriceList._collection.remove({});
      await PriceListRate._collection.remove({});
      priceListId = await PriceList._collection.insert({
        ...generateDataRoad({ accountId, carrierId }),
        status: "draft"
      }); // returns id
      return true;
    });
    it("throws an error when not logged in", async function() {
      let checkError;
      try {
        await resolvers.Mutation.addAttachment(null, { input: {} }, {});
      } catch (error) {
        checkError = error;
      }
      expect(checkError).to.be.an("error");
      expect(checkError.message).to.match(/not-authorized/);
    });
    it("adds an attachment from the parameters", async function() {
      const attachment = generateAttachmentData({ accountId });
      const allAttachments = await resolvers.Mutation.addAttachment(
        null,
        { input: { priceListId, attachment } },
        context
      ); // returns array of documents attached to pricelist

      expect(allAttachments).to.be.an("array");
      expect(allAttachments[0]).to.be.an("object");
      expect(allAttachments[0].store.service).to.equal("s3");
    });
  });
  describe("delete-attachment", function() {
    const accountId = ACCOUNT_ID;
    const userId = USER_ID;
    const carrierId = CARRIER_ID;
    const context = { accountId, userId };
    let priceListId;
    beforeEach(async function() {
      await PriceList._collection.remove({});
      await PriceListRate._collection.remove({});
      priceListId = await PriceList._collection.insert({
        ...generateDataRoad({ accountId, carrierId }),
        status: "draft"
      }); // returns id

      // add an attachment:
      const attachment = generateAttachmentData();
      await resolvers.Mutation.addAttachment(
        null,
        { input: { priceListId, attachment } },
        context
      );
      return true;
    });
    it("throws an error when not logged in", async function() {
      let errorTest;
      try {
        await resolvers.Mutation.removeAttachment(null, { input: {} }, {});
      } catch (error) {
        errorTest = error;
      }
      expect(errorTest).to.be.an("error");
      expect(errorTest.message).to.match(/not-authorized/);
    });
    it("deletes an attachment from the parameters", async function() {
      // try to remove it:
      const input = { priceListId, index: 0 };
      const allAttachments = await resolvers.Mutation.removeAttachment(
        null,
        { input },
        context
      );

      expect(allAttachments).to.be.an("array");
      expect(allAttachments).to.have.lengthOf(0);
    });
  });
});
