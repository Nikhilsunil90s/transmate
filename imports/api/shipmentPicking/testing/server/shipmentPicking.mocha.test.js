/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
import { Meteor } from "meteor/meteor";
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection";
import { expect } from "chai";
import { resolvers } from "../../apollo/resolvers";
import { Shipment } from "/imports/api/shipments/Shipment";

import { generatePickingItems } from "../generatePickingItems";
import { generatePackItemsArgs } from "../generatePackItemsArgs";
import { ShipmentItem } from "/imports/api/items/ShipmentItem";
import { confirmShipmentLabelOption } from "/imports/api/shipmentPicking/services/mutation.confirmShipmentLabelOption";
import { confirmOptionMock } from "/imports/api/shipmentPicking/services/DHL/testing/confirmOptionMock";

const debug = require("debug")("shipmentpicking:test");

const ACCOUNT_ID = "S65957";
const USER_ID = "jsBor6o3uRBTFoRQY";
const ADDRESS_ID = "j958tYA872PAogTDq";
const SHIPMENT_ID = "2jG2mZFcaFzqaThcr";

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(12, 0, 0, 0);

// const printError = checks => JSON.stringify(checks);
/** helper to mock a confirmed label
 * @param {string} shipmentId
 * @param {string[]} packingUnitIds
 */
const mockConfirm = (shipmentId, packingUnitIds) => {
  return Promise.all([
    ShipmentItem._collection.update(
      { _id: { $in: packingUnitIds } },
      {
        $set: {
          "references.trackingNumber": "RANDOM_TRACKING_NR",
          labelUrl: "SOME_LABEL_URL"
        }
      }
    ),
    Shipment._collection.update(
      { _id: shipmentId },
      {
        $set: {
          pickingStatus: "printed",
          trackingNumbers: ["RANDOM_TRACKING_NR"]
        },
        $push: {
          costs: {
            $each: [
              {
                id: "AfRmSg",
                costId: "o6fLThAWhaWW3uDaj",
                isManualBaseCost: true,
                description: "Express Worldwide",
                source: "api",
                meta: { packingItemIds: packingUnitIds },
                amount: { value: 193.3, currency: "EUR" },
                added: { by: "jsBor6o3uRBTFoRQY", at: new Date() },
                accountId: "S65957",
                sellerId: "C00001",
                date: new Date()
              },
              {
                id: "32adGy",
                costId: "JpKrR3PggDfp8dnNP",
                isManualBaseCost: false,
                description: "Emergency Situation",
                source: "api",
                meta: {
                  chargeCode: "CR",
                  packingItemIds: packingUnitIds
                },
                amount: { value: 8.7, currency: "EUR" },
                added: { by: "jsBor6o3uRBTFoRQY", at: new Date() },
                accountId: "S65957",
                sellerId: "C00001",
                date: new Date()
              },
              {
                id: "3ynHgk",
                costId: "rFRy3NwqyhaWwqJuJ",
                isManualBaseCost: false,
                description: "Fuel Surcharge",
                source: "api",
                meta: {
                  chargeCode: "FF",
                  packingItemIds: packingUnitIds
                },
                amount: { value: 32.32, currency: "EUR" },
                added: { by: "jsBor6o3uRBTFoRQY", at: new Date() },
                accountId: "S65957",
                sellerId: "C00001",
                date: new Date()
              }
            ]
          }
        }
      }
    )
  ]);
};

let defaultMongo;

describe("shipmentPicking", function() {
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      debug("resetdb");
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo");
      await defaultMongo.connect();
    }

    const resetDone = await resetDb({ resetUsers: true });
    if (!resetDone) throw Error("reset was not possible, test can not run!");
    Meteor.setUserId && Meteor.setUserId(USER_ID);
  });
  describe("resolvers", function() {
    const context = {
      accountId: ACCOUNT_ID,
      userId: USER_ID
    };
    describe("getPickingOverview", function() {
      it("[toPickItems]gets default view for addressId", async function() {
        await Shipment._collection.update(
          { "pickup.location.addressId": ADDRESS_ID },
          { $set: { pickingStatus: "none", status: "draft" } },
          { multi: true }
        );

        const args = { input: { addressId: ADDRESS_ID } };
        const res = await resolvers.Query.getPickingOverview(
          null,
          args,
          context
        );

        expect(res).to.be.an("array");

        res.forEach(({ pickup }) =>
          expect(pickup.location.addressId).to.equal(ADDRESS_ID)
        );
        expect(res).to.have.lengthOf(4);
      });
      it("[packedItems] gets packed shipments for addressId", async function() {
        await Shipment._collection.update(
          { "pickup.location.addressId": ADDRESS_ID },
          { $set: { pickingStatus: "packed", status: "draft" } },
          { multi: true }
        );
        const args = {
          input: { viewKey: "packedItems", addressId: ADDRESS_ID }
        };
        const res = await resolvers.Query.getPickingOverview(
          null,
          args,
          context
        );
        expect(res).to.be.an("array");
        res.forEach(({ pickup }) =>
          expect(pickup.location.addressId).to.equal(ADDRESS_ID)
        );
        expect(res).to.have.lengthOf(4);
      });
      it("[shippedItems] gets shipped/printed shipments for addressId", async function() {
        await Shipment._collection.update(
          { "pickup.location.addressId": ADDRESS_ID },
          { $set: { pickingStatus: "printed", status: "started" } },
          { multi: true }
        );
        const args = {
          input: { viewKey: "shippedItems", addressId: ADDRESS_ID }
        };
        const res = await resolvers.Query.getPickingOverview(
          null,
          args,
          context
        );

        expect(res).to.be.an("array");
        expect(res).to.have.lengthOf(4);
      });
    });
    describe("getPickingDetail", function() {
      beforeEach(async function() {
        // add some picking items:
        await generatePickingItems({ count: 10, shipmentId: SHIPMENT_ID });
      });
      it("get detail picking view for shipment", async function() {
        const args = { shipmentId: SHIPMENT_ID };
        const res = await resolvers.Query.getPickingDetail(null, args, context);
        expect(res).to.be.an("object");
        expect(res.nestedItems).to.be.an("array");
        expect(res.nestedItems).to.have.lengthOf(10);
      });
    });

    // mutations:
    describe("packShipmentItems", function() {
      let itemIds = [];
      beforeEach(async function() {
        await resetCollections(["items", "shipments"]);

        // add some picking items:
        itemIds = await generatePickingItems({
          count: 4,
          shipmentId: SHIPMENT_ID
        });
      });
      it("packs items in a NEW packing unit", async function() {
        const {
          shipmentId,
          shipmentItemIds,
          parentItem
        } = generatePackItemsArgs({
          shipmentId: SHIPMENT_ID,
          shipmentItemIds: itemIds
        });
        const args = {
          input: { shipmentId, shipmentItemIds, parentItem }
        };

        const res = await resolvers.Mutation.packShipmentItems(
          null,
          args,
          context
        );

        expect(res).to.be.an("object");

        const { shipment, result } = res;
        expect(shipment.nestedItems).to.be.an("array");
        const packingUnit = shipment.nestedItems.find(
          ({ isPackingUnit }) => isPackingUnit
        );

        expect(packingUnit).to.be.an("object");

        expect(packingUnit.weight_gross).to.equal(
          args.input.parentItem.weight_gross
        );

        const packedItems = shipment.nestedItems.filter(
          ({ parentItemId }) => parentItemId === packingUnit.id
        );
        expect(packedItems).to.have.lengthOf(4);
        expect(packedItems.every(({ isPicked }) => isPicked)).to.equal(true);

        expect(shipment.pickingStatus).to.equal("packed");

        expect(result.errorCount).to.equal(0);
      });
      it("packs items in an EXISTING packing unit", async function() {
        // prep:
        const parentItem = await ShipmentItem.create_async({
          _id: "5aSDtm2FZEokHjLJ9",
          shipmentId: SHIPMENT_ID,
          level: 0,
          type: "HU",
          isPackingUnit: true,
          quantity: { code: "PAL", amount: 1 },
          weight_net: 100,
          weight_gross: 210,
          weight_unit: "kg",
          dimensions: { length: 100, width: 200, height: 300, uom: "cm" }
        });

        const parentItemId = parentItem.id;

        // 2 items are packed:
        await ShipmentItem._collection.update(
          { _id: { $in: itemIds.slice(2) } },
          { $set: { parentItemId, isPicked: true } }
        );

        const args = {
          input: generatePackItemsArgs({
            shipmentId: SHIPMENT_ID,
            shipmentItemIds: itemIds
          })
        };

        const res = await resolvers.Mutation.packShipmentItems(
          null,
          args,
          context
        );

        expect(res).to.be.an("object");
        const { shipment, result } = res;
        expect(shipment.nestedItems).to.be.an("array");

        const packingUnit = shipment.nestedItems.find(
          ({ isPackingUnit }) => isPackingUnit
        );

        expect(packingUnit).to.not.equal(undefined);
        expect(packingUnit.weight_gross).to.equal(
          args.input.parentItem.weight_gross
        );

        const packedItems = shipment.nestedItems.filter(
          ({ parentItemId: iid }) => iid === packingUnit.id
        );
        expect(packedItems).to.not.equal(undefined);

        const HUs = shipment.nestedItems.filter(
          ({ type, isPackingUnit }) => type === "HU" && !isPackingUnit
        );
        expect(HUs).to.have.lengthOf(4);
        expect(HUs.every(({ isPicked }) => isPicked)).to.equal(true);

        expect(shipment.pickingStatus).to.equal("packed");
        expect(result.errorCount).to.equal(0);
      });
    });
    describe("unpackShipmentItems", function() {
      let itemIds = [];
      beforeEach(async function() {
        await resetCollections(["items", "shipments"]);

        // add some picking items:
        itemIds = await generatePickingItems({
          count: 4,
          shipmentId: SHIPMENT_ID
        });
      });

      // unpackShipmentItems(packingUnitsIds: [String]!): packShipmentItemsResponse
      it("unpacks items ", async function() {
        //#region data prep: 1 pack item:
        const args = {
          input: generatePackItemsArgs({
            shipmentId: SHIPMENT_ID,
            shipmentItemIds: itemIds
          })
        };

        const res = await resolvers.Mutation.packShipmentItems(
          null,
          args,
          context
        );

        const packingUnit = res.shipment.nestedItems.find(
          ({ isPackingUnit }) => isPackingUnit
        );
        expect(packingUnit).to.not.equal(undefined);
        //#endregion

        // unpack + test:
        const args2 = { packingUnitsIds: [packingUnit.id] };
        const res2 = await resolvers.Mutation.unpackShipmentItems(
          null,
          args2,
          context
        );

        expect(res2).to.be.an("object");

        const { shipment, result } = res2;

        expect(shipment.nestedItems).to.be.an("array");
        expect(shipment.nestedItems.every(({ isPicked }) => isPicked)).to.equal(
          false
        );

        // test if the packing unit has been deleted:
        const packingUnits = shipment.nestedItems.filter(
          ({ isPackingUnit }) => isPackingUnit
        );
        expect(packingUnits).to.have.lengthOf(0);

        expect(shipment.pickingStatus).to.not.equal("packed");
        expect(result.errorCount).to.equal(0);
      });
    });
    describe("printPickingList", function() {
      it("prints a picking list", async function() {
        const args = { shipmentId: SHIPMENT_ID };
        const res = await resolvers.Mutation.printPickingList(
          null,
          args,
          context
        );
        expect(res.shipment.pickingStatus).to.equal("printed");
        expect(res.documentUrl).to.not.equal(undefined);
      });
    });

    describe("confirmShipmentLabelOption", function() {
      let itemIds;

      // we will test the service in order to ommit the remote fn call.

      beforeEach(async function() {
        await resetCollections(["items", "shipments"]);

        // add some picking items:
        itemIds = await generatePickingItems({
          count: 4,
          shipmentId: SHIPMENT_ID
        });
      });

      // confirmShipmentLabelOption(input: confirmShipmentLabelOptionInput!): ShipmentItemType
      it("confirmShipmentLabelOption", async function() {
        //#region data prep: 1 pack item:
        const args = {
          input: generatePackItemsArgs({
            shipmentId: SHIPMENT_ID,
            shipmentItemIds: itemIds
          })
        };

        const res = await resolvers.Mutation.packShipmentItems(
          null,
          args,
          context
        );

        const packingUnits = res.shipment.nestedItems.filter(
          ({ isPackingUnit }) => isPackingUnit
        );
        expect(packingUnits).to.not.equal(undefined);
        expect(packingUnits).to.have.lengthOf(1);

        const packingItemIds = packingUnits.map(({ id }) => id);
        //#endregion

        // TESTING THE SERVICE INSTEAD OF THE RESOLVER!!!
        const srv = confirmShipmentLabelOption(context);
        await srv.init({ packingItemIds });
        await srv.getCustomsValues();

        // MOCK THE DHL CALL:
        srv.label = confirmOptionMock({ packingItemIds });
        srv.trackingNumbers = srv.label.trackingNumbers || {};
        srv.rateRequest = {};
        srv.operationType = "dhl-direct";

        await srv.storeLabelInfo();
        await srv.setShipmentAllocation();

        const mutationRes = await srv.getUIResponse();

        expect(mutationRes).to.not.equal(undefined);
        expect(mutationRes).to.be.an("object");
        const { shipment: shipmentResult, labelUrl } = mutationRes;
        expect(labelUrl).to.be.a("string");
        expect(shipmentResult.pickingStatus).to.equal("printed");

        expect(shipmentResult.trackingNumbers).to.be.an("array");
        expect(shipmentResult.trackingNumbers).to.include(
          Object.values(srv.trackingNumbers)[0]
        );

        expect(shipmentResult.nestedItems).to.be.an("array");
        const packingUnitInResult = shipmentResult.nestedItems.find(
          ({ isPackingUnit }) => isPackingUnit
        );
        expect(packingUnitInResult).to.not.equal(undefined);
        expect(packingUnitInResult.labelUrl).to.not.equal(undefined);
        expect(packingUnitInResult.references.trackingNumber).to.not.equal(
          undefined
        );

        // test if costs were allocated:
        const shipmentTest = await Shipment.first(SHIPMENT_ID, {
          fields: { costs: 1 }
        });

        expect(shipmentTest.costs).to.not.equal(undefined);
        expect(shipmentTest.costs).to.be.an("array");
        expect(shipmentTest.costs).to.be.an("array");

        const addedCosts = shipmentTest.costs.filter(
          ({ source }) => source === "api"
        );
        expect(addedCosts).to.have.lengthOf(3);
      });
    });
    describe("printPickingManifest", function() {
      let itemIds;

      // we will test the service in order to ommit the remote fn call.

      beforeEach(async function() {
        await resetCollections(["items", "shipments"]);

        // add some picking items:
        itemIds = await generatePickingItems({
          count: 4,
          shipmentId: SHIPMENT_ID
        });
      });
      it("[printPickingManifest] flags shipments & calculates costs", async function() {
        //#region data prep: 1 pack item AND confirm a label -> shipment status === printed

        const args = {
          input: generatePackItemsArgs({
            shipmentId: SHIPMENT_ID,
            shipmentItemIds: itemIds
          })
        };

        const res = await resolvers.Mutation.packShipmentItems(
          null,
          args,
          context
        );

        const packingUnits = res.shipment.nestedItems.filter(
          ({ isPackingUnit }) => isPackingUnit
        );
        expect(packingUnits).to.not.equal(undefined);
        const packingItemIds = packingUnits.map(({ id }) => id);

        const srv = confirmShipmentLabelOption(context);
        await srv.init({ packingItemIds });

        // MOCK THE DHL CALL:
        srv.label = confirmOptionMock({ packingItemIds });
        srv.trackingNumbers = srv.label.trackingNumbers || {};
        srv.rateRequest = {};
        srv.operationType = "dhl-direct";

        await srv.storeLabelInfo();
        await srv.setShipmentAllocation();

        // now the shipment is ready to be printed (= shipped) for the manifest:

        //#endregion

        const args3 = {
          input: { shipmentIds: [SHIPMENT_ID], printManifest: true }
        };
        const manifestResult = await resolvers.Mutation.printPickingManifest(
          null,
          args3,
          context
        );

        // manifest result is an array of shipments that are started:
        expect(manifestResult).to.be.an("array");
        expect(manifestResult[0]).to.be.an("object");
        expect(manifestResult[0].type).to.equal("parcel");
        expect(manifestResult[0].type).to.equal("parcel");
        expect(manifestResult[0].status).to.equal("started");
        expect(manifestResult[0].pickup.dateActual).to.not.equal(undefined);
      });
    });
    describe("cancelPackingLabel", function() {
      let itemIds;

      // we will test the service in order to ommit the remote fn call.

      beforeEach(async function() {
        await resetCollections(["items", "shipments"]);

        // add some picking items:
        itemIds = await generatePickingItems({
          count: 4,
          shipmentId: SHIPMENT_ID
        });
      });
      it("cancels from itemIds", async function() {
        //#region data prep: 1 pack item:
        const args = {
          input: generatePackItemsArgs({
            shipmentId: SHIPMENT_ID,
            shipmentItemIds: itemIds
          })
        };

        const res = await resolvers.Mutation.packShipmentItems(
          null,
          args,
          context
        );

        const packingUnits = res.shipment.nestedItems.filter(
          ({ isPackingUnit }) => isPackingUnit
        );
        expect(packingUnits).to.not.equal(undefined);
        expect(packingUnits).to.have.lengthOf(1);

        const packingItemIds = packingUnits.map(({ id }) => id);

        // confirm the label (mocked)
        await mockConfirm(SHIPMENT_ID, packingItemIds);

        const args2 = {
          packingItemIds
        };
        const cancelPacking = await resolvers.Mutation.cancelPackingLabel(
          null,
          args2,
          context
        );
        expect(cancelPacking).to.not.equal(undefined);
        expect(cancelPacking.pickingStatus).to.equal("packed");
        expect(cancelPacking.nestedItems[0].type).to.equal("HU");
      });
      it("cancels from shipmentId", async function() {
        //#region data prep: 1 pack item:
        const args = {
          input: generatePackItemsArgs({
            shipmentId: SHIPMENT_ID,
            shipmentItemIds: itemIds
          })
        };

        const res = await resolvers.Mutation.packShipmentItems(
          null,
          args,
          context
        );

        const packingUnits = res.shipment.nestedItems.filter(
          ({ isPackingUnit }) => isPackingUnit
        );
        expect(packingUnits).to.not.equal(undefined);
        expect(packingUnits).to.have.lengthOf(1);

        const packingItemIds = packingUnits.map(({ id }) => id);

        // confirm the label (mocked)
        await mockConfirm(SHIPMENT_ID, packingItemIds);

        // test if costs were allocated:
        const shipmentTest = await Shipment.first(SHIPMENT_ID, {
          fields: { costs: 1 }
        });

        expect(shipmentTest.costs).to.not.equal(undefined);
        expect(shipmentTest.costs).to.be.an("array");
        expect(shipmentTest.costs).to.be.an("array");

        const addedCosts = shipmentTest.costs.filter(
          ({ source }) => source === "api"
        );
        expect(addedCosts).to.have.lengthOf(3);

        const args2 = {
          shipmentId: SHIPMENT_ID
        };
        const cancelPackingResult = await resolvers.Mutation.cancelPackingLabel(
          null,
          args2,
          context
        );
        expect(cancelPackingResult).to.not.equal(undefined);
        expect(cancelPackingResult.pickingStatus).to.equal("packed"); // otherwise it is printed
        expect(cancelPackingResult.nestedItems[0].type).to.equal("HU");

        expect(cancelPackingResult.trackingNumbers).to.eql([]);

        // test if costs were removed:
        const shipmentTest2 = await Shipment.first(SHIPMENT_ID, {
          fields: { costs: 1 }
        });

        expect(shipmentTest2.costs).to.not.equal(undefined);
        expect(shipmentTest2.costs).to.be.an("array");
        expect(shipmentTest2.costs).to.be.an("array");

        const addedCosts2 = shipmentTest2.costs.filter(
          ({ source }) => source === "api"
        );
        expect(addedCosts2).to.have.lengthOf(0);
      });
    });
  });
});
