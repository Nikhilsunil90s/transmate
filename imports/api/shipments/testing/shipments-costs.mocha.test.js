/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
import { Meteor } from "meteor/meteor";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection";
import { expect } from "chai";

import { Shipment } from "../Shipment";
import { resolvers } from "/imports/api/shipments/apollo/resolvers.js";
import { getCostItemForResolver } from "./data/shipmentTestData";
import { CheckShipmentSecurity } from "/imports/utils/security/checkUserPermissionForShipment";

const debug = require("debug")("shipment:cost:test");

const ACCOUNT_ID = "S65957";
const USER_ID = "jsBor6o3uRBTFoRQY";
const SHIPMENT_ID_WITH_COSTS = "2jG2mZFcaFzqaThcr";
const SHIPMENT_ID_WITHOUT_COSTS = "2jG2mZFcaFzqaThXX";
const CARRIER_ID = "C75701";
const CARRIER_USER_ID = "pYFLYFDMJEnKADY3h";

const DUMMY_PRICE_LOOKUP_RESULT = {
  __typename: "PriceLookupItem",
  id: "QLabKRYWjZEBXdSwz",
  bestCost: true,
  bestLeadTime: true,
  calculation: {
    errors: [],
    leadTime: {
      days: [true, true, true, true, true, true, false],
      frequency: "weekly",
      leadTimeHours: 24
    },
    quantity: { BL: 1, doc: 1, kg: 0, shipment: 1, stage: 1, stop: 1 }
  },
  carrierId: "C11051",
  carrierName: "Carrier Beta",
  category: "standard",
  costs: [
    {
      __typename: "PriceLookupCost",
      rate: {
        __typename: "PriceListRate",
        costId: "o6fLThAWhaWW3uDaj",
        meta: {
          __typename: "PriceListRateMetaType",
          source: "table",
          color: null,
          leg: null,
          type: null
        },
        tooltip: "1000 EUR per shipment",
        name: "Base rate",
        amount: {
          __typename: "PriceListRateAmountType",
          unit: "EUR",
          value: 1000
        }
      },
      total: {
        __typename: "PriceLookupCostTotal",
        convertedCurrency: "EUR",
        convertedValue: 1000,
        exchange: 1,
        listCurrency: "EUR",
        listValue: 1000
      }
    }
  ],
  customerId: "S65957",
  leadTime: {
    __typename: "PriceLookupLeadtime",
    definition: {
      days: [true, true, true, true, true, true, false],
      frequency: "weekly",
      leadTimeHours: 24
    },
    hours: 24
  },
  mode: "road",
  priceRequestId: "swEbwbQuMWZf48T4J",
  biddingNotes: "test",
  priceRequest: { __typename: "PriceRequestMeta", notes: "test" },
  status: "for-approval",
  title: "PR_0426-T4J_V1 by C11051 2021-04-26",
  totalCost: 1000,
  validFrom: 1619465677718,
  validTo: 1651001677718
};

let defaultMongo;
describe("shipment-costs", function() {
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../.testing/mocha/DefaultMongo");
      await defaultMongo.connect();
    }

    const resetDone = await resetCollections([
      "users",
      "roleAssingments",
      "accounts",
      "shipments",
      "stages",
      "items"
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
      await resetCollections(["shipments"]);
    });
    it("[editShipmentCosts][owner]adds a manual cost (no other set)", async function() {
      await Shipment._collection.update(
        { _id: SHIPMENT_ID_WITHOUT_COSTS },
        { $set: { carrierIds: [CARRIER_ID], costs: [] } } // carrier should be set, no costs
      );
      const args = {
        input: {
          shipmentId: SHIPMENT_ID_WITHOUT_COSTS,
          index: undefined,
          cost: {
            ...getCostItemForResolver(),
            type: "additional"
          }
        }
      };
      const updatedShipment = await resolvers.Mutation.editShipmentCosts(
        null,
        args,
        context
      );

      expect(updatedShipment).to.not.equal(undefined);
      expect(updatedShipment.costs).to.be.an("array");
      const addedCost = updatedShipment.costs.pop(); // last one is the base cost:
      expect(addedCost).to.not.equal(undefined);
      expect(addedCost.description).to.equal(args.input.cost.description);
      expect(addedCost.forApproval).to.equal(true);
    });
    it("[editShipmentCosts][owner]adds a manual cost (other set)", async function() {
      const args = {
        input: {
          shipmentId: SHIPMENT_ID_WITH_COSTS,
          index: undefined,
          cost: {
            ...getCostItemForResolver(),
            type: "additional",
            amount: { value: 20, currency: "USD" }
          }
        }
      };
      debug("a manual cost %j", args);
      const updatedShipment = await resolvers.Mutation.editShipmentCosts(
        null,
        args,
        context
      );

      expect(updatedShipment).to.not.equal(undefined);
      expect(updatedShipment.costs).to.be.an("array");
      expect(updatedShipment.costs).to.have.lengthOf(4);

      const addedCost = updatedShipment.costs.pop(); // last one is the base cost:
      expect(addedCost).to.not.equal(undefined);
      debug("addedCost cost %o", addedCost);
      expect(addedCost.description).to.equal(args.input.cost.description);
      expect(addedCost.forApproval).to.equal(true);
    });
    it("[editShipmentCosts][owner] adds a base cost", async function() {
      await Shipment._collection.update(
        { _id: SHIPMENT_ID_WITHOUT_COSTS },
        { $set: { carrierIds: [CARRIER_ID], costs: [] } } // carrier should be set, no costs
      );
      const args = {
        input: {
          shipmentId: SHIPMENT_ID_WITHOUT_COSTS,
          index: undefined,
          cost: {
            ...getCostItemForResolver(),
            type: "base"
          }
        }
      };
      const updatedShipment = await resolvers.Mutation.editShipmentCosts(
        null,
        args,
        context
      );

      expect(updatedShipment).to.not.equal(undefined);
      expect(updatedShipment.costs).to.be.an("array");
      const addedCost = updatedShipment.costs.pop(); // last one is the base cost:
      expect(addedCost).to.not.equal(undefined);
      expect(addedCost.description).to.equal(args.input.cost.description);
      expect(addedCost.isManualBaseCost).to.equal(true);
    });
    it("[editShipmentCosts][partner]adds a manual cost (other set)", async function() {
      await Shipment._collection.update(
        { _id: SHIPMENT_ID_WITH_COSTS },
        { $set: { carrierIds: [CARRIER_ID] } }
      );
      const args = {
        input: {
          shipmentId: SHIPMENT_ID_WITH_COSTS,
          index: undefined,
          cost: {
            ...getCostItemForResolver(CARRIER_ID),
            type: "additional",
            amount: { value: 20, currency: "USD" }
          }
        }
      };
      debug("a manual cost %j", args);
      const updatedShipment = await resolvers.Mutation.editShipmentCosts(
        null,
        args,
        { userId: CARRIER_USER_ID, accountId: CARRIER_ID }
      );

      expect(updatedShipment).to.not.equal(undefined);
      expect(updatedShipment.costs).to.be.an("array");
      expect(updatedShipment.costs).to.have.lengthOf(4);

      const addedCost = updatedShipment.costs.slice(-1)[0]; // last one is the base cost:
      expect(addedCost).to.not.equal(undefined);
      debug("addedCost cost %o", addedCost);
      expect(addedCost.description).to.equal(args.input.cost.description);
      expect(addedCost.forApproval).to.equal(true);

      expect(addedCost.added.by).to.equal(CARRIER_USER_ID);
    });
    it("[resetShipmentCosts] resets costs in a shpment", async function() {
      //  status "draft" + carrier assigned + isOwner of shipment

      const res = await resolvers.Mutation.resetShipmentCosts(
        null,
        { shipmentId: SHIPMENT_ID_WITH_COSTS },
        context
      );

      expect(res).to.not.equal(undefined);
      expect(res.costs).to.be.an("array");
      expect(res.costs).to.have.lengthOf(0);
      expect(res.carrierIds).to.have.lengthOf(0);
    });
    it("[approveDeclineShipmentCosts] approve manual cost", async function() {
      // 1: find the manual cost:
      const shipmentWithCosts = await Shipment.first(SHIPMENT_ID_WITH_COSTS, {
        fields: { costs: 1 }
      });
      const index = shipmentWithCosts.costs.findIndex(
        costEl => costEl.source === "input"
      );

      const args = {
        input: {
          shipmentId: SHIPMENT_ID_WITH_COSTS,
          index,
          action: "approve"
        }
      };
      const res = await resolvers.Mutation.approveDeclineShipmentCosts(
        null,
        args,
        context
      );

      expect(res).to.not.equal(undefined);
      expect(res.costs[index]).to.be.an("object");
      expect(res.costs[index].forApproval).to.equal(false);
      expect(res.costs[index].response.approved).to.equal(true);
    });
    it("[approveDeclineShipmentCosts] decline manual cost", async function() {
      // 1: find the manual cost:
      const shipmentWithCosts = await Shipment.first(SHIPMENT_ID_WITH_COSTS, {
        fields: { costs: 1 }
      });
      const index = shipmentWithCosts.costs.findIndex(
        costEl => costEl.source === "input"
      );

      const args = {
        input: {
          shipmentId: SHIPMENT_ID_WITH_COSTS,
          index,
          action: "decline",
          response: {
            reason: "wrong",
            comment: "Not ok"
          }
        }
      };
      const res = await resolvers.Mutation.approveDeclineShipmentCosts(
        null,
        args,
        context
      );
      expect(res).to.not.equal(undefined);
      expect(res.costs[index]).to.be.an("object");
      expect(res.costs[index].forApproval).to.equal(false);
      expect(res.costs[index].response.approved).to.equal(false);
      expect(res.costs[index].response.reason).to.equal(
        args.input.response.reason
      );
      expect(res.costs[index].response.comment).to.equal(
        args.input.response.comment
      );
    });
    it("[selectShipmentCarrier] selects carrier from costOptions in UI", async function() {
      const SELECTED_CARRIER_ID = "C69205";
      const args = {
        shipmentId: SHIPMENT_ID_WITHOUT_COSTS,
        carrierId: SELECTED_CARRIER_ID,
        priceListId: "n8pYLq3LEzZDHqYS4",
        priceListResult: DUMMY_PRICE_LOOKUP_RESULT
      };
      const updatedShipment = await resolvers.Mutation.selectShipmentCarrier(
        null,
        args,
        context
      );

      expect(updatedShipment).to.be.an("object");
      expect(updatedShipment.carrierIds).to.be.an("array");
      expect(updatedShipment.carrierIds[0]).to.equal(SELECTED_CARRIER_ID);
      expect(updatedShipment.costs).to.be.an("array");
      expect(updatedShipment.costs).to.have.lengthOf(1);
      expect(updatedShipment.costs[0].source).to.equal("priceList");
      expect(updatedShipment.costs[0].accountId).to.equal(context.accountId);
      expect(updatedShipment.costs[0].id).to.not.equal(undefined);

      // partner should be saved:
      expect(updatedShipment.costs[0].sellerId).to.equal(args.carrierId);
    });
    it("[selectShipmentCarrier] unsets carrier", async function() {
      await Shipment._collection.update(
        { _id: SHIPMENT_ID_WITH_COSTS },
        {
          $push: {
            costs: {
              amount: { value: 100, currency: "EUR", rate: 1 },
              description: "some cost",
              costId: "JpKrR3PggDfp8dnNP",
              id: "OPC7CD",
              source: "priceList",
              accountId: "S65957",
              sellerId: "C11051",
              added: {
                by: "W3WguXKt2cLu2h8LM",
                at: new Date(),
                atms: 1556194313007
              },
              forApproval: true,
              isManualBaseCost: false,
              date: new Date()
            }
          }
        }
      );
      const args = {
        shipmentId: SHIPMENT_ID_WITH_COSTS,
        carrierId: null,
        priceListId: null,
        priceListResult: null
      };
      const updatedShipment = await resolvers.Mutation.selectShipmentCarrier(
        null,
        args,
        context
      );

      expect(updatedShipment).to.be.an("object");
      expect(updatedShipment.carrierIds).to.be.an("array");
      expect(updatedShipment.carrierIds).to.have.lengthOf(0);

      expect(updatedShipment.costs).to.be.an("array");

      expect(updatedShipment.costs).to.have.lengthOf(1);
      expect(updatedShipment.costs[0].source).to.equal("input");
    });
  });

  describe("security", function() {
    let shipmentWithCosts;
    let shipmentWithoutCosts;
    const context = {
      accountId: ACCOUNT_ID,
      userId: USER_ID
    };
    before(async function() {
      shipmentWithCosts = await Shipment.first(SHIPMENT_ID_WITH_COSTS);

      await Shipment._collection.update(
        { _id: SHIPMENT_ID_WITHOUT_COSTS },
        { $set: { carrierIds: [CARRIER_ID] } }
      );
      shipmentWithoutCosts = await Shipment.first(SHIPMENT_ID_WITHOUT_COSTS);
    });
    it("[addBaseCost] allows to add base costs when no calculated costs present and owner of shipment", async function() {
      const check = new CheckShipmentSecurity(
        {
          shipment: shipmentWithoutCosts
        },
        context
      );
      await check.getUserRoles();
      check.can({ action: "addBaseCost" });
      expect(check.check()).to.equal(true);
    });
    it("[addBaseCost] does not allow to add base costs when calculated costs are present and owner of shipment", async function() {
      const check = new CheckShipmentSecurity(
        {
          shipment: shipmentWithCosts
        },
        context
      );
      await check.getUserRoles();
      check.can({ action: "addBaseCost" });
      expect(check.check()).to.equal(false);
    });
    it("[addManualCost][as owner] allows to add a cost", async function() {
      const check = new CheckShipmentSecurity(
        {
          shipment: shipmentWithoutCosts
        },
        context
      );
      await check.getUserRoles();
      check.can({ action: "addManualCost" });
      expect(check.check()).to.equal(true);
    });
    it("[addManualCost][as carrier] allows to add a cost", async function() {
      const check = new CheckShipmentSecurity(
        { shipment: shipmentWithoutCosts },
        { userId: CARRIER_USER_ID, accountId: CARRIER_ID }
      );
      await check.getUserRoles();
      check.can({ action: "addManualCost" });
      expect(check.check()).to.equal(true);
    });
    it("[removeManualCost] allows to remove a cost when userIds match", async function() {
      // 1: find the manual cost:
      const manualCost = shipmentWithCosts.costs.find(
        costEl => costEl.source === "input"
      );
      manualCost.added.by = context.userId; // just to make sure that it is as if current user has added it

      const check = new CheckShipmentSecurity(
        {
          shipment: shipmentWithCosts
        },
        context
      );
      await check.getUserRoles();
      check.can({ action: "removeManualCost", data: { cost: manualCost } });
      expect(check.check()).to.equal(true);
    });
    it("[resetcosts] allows to reset costs in shipment", async function() {
      const check = new CheckShipmentSecurity(
        {
          shipment: {
            ...shipmentWithCosts,
            status: "draft",
            carrierIds: ["C12345"]
          }
        },
        context
      );
      await check.getUserRoles();
      check.can({ action: "resetCosts" });
      expect(check.check(true)).to.equal(true, check.checks);
    });
    it("[viewCostSection] allows to view the cost section as owner", async function() {
      const check = new CheckShipmentSecurity(
        {
          shipment: shipmentWithCosts
        },
        context
      );
      await check.getUserRoles();
      check.can({ action: "viewCostSection" });
      expect(check.check()).to.equal(true);
    });

    it("[viewCostSection][carrier] allows to view the cost section as carrier", async function() {
      const check = new CheckShipmentSecurity(
        {
          shipment: {
            ...shipmentWithCosts,
            status: "planned",
            carrierIds: [CARRIER_ID]
          }
        },
        { userId: CARRIER_USER_ID, accountId: CARRIER_ID }
      );
      await check.getUserRoles();
      check.can({ action: "viewCostSection" });
      expect(check.check()).to.equal(true);
    });
  });
});
