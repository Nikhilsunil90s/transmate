/* eslint-disable func-names */
import { expect } from "chai";
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection";

import { shipmentOverViewAggregation } from "../../services/OverviewAggregation";
import { resolvers } from "../../apollo/resolvers";
import { ShipmentsView } from "../../ShipmentsView";
import { Shipment } from "/imports/api/shipments/Shipment";

const debug = require("debug")("test:shipment-overview");

const viewDoc = {
  _id: "Hqsf7JEYAwzuXMRg8",
  name: "RealTime (live)",
  columns: ["shipment.mode", "shipment.number"],
  type: "global",
  shipmentOverviewType: "mongo"
};

const ACCOUNT_ID = "S65957";
const USER_ID = "jsBor6o3uRBTFoRQY";
const SHIPMENT_VIEW_ID = "Hqsf7JEYAwzuXMRg7"; // all shipments in mongodb view
const USER_WITHOUT_ENTITIES = "RGTj7c6qQPLMTojG3";

const CARRIER_ACCOUNT_ID = "C11051";
const CARRIER_USER_ID = "ojWEu2JwuvZJcAZXX";

const SHIPPER_ACCOUNT_ID = "S79207";
const SHIPPER_USER_ID = "K3hqjR5zBoDZRccEx";

let defaultMongo;
describe("shipment-overview", function() {
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo");
      await defaultMongo.connect();
    }

    const resetDone = await resetDb({ resetUsers: true });
    if (!resetDone) throw Error("reset was not possible, test can not run!");
  });

  const userId = USER_ID;
  const accountId = ACCOUNT_ID;
  describe("prepareSearch", function() {
    describe("shipment-filters", function() {
      it("status filter", async function() {
        const view = { ...viewDoc, filters: { status: { values: ["draft"] } } };
        const factoryFn = shipmentOverViewAggregation({
          userId,
          accountId,
          view,
          start: 0,
          length: 20
        });

        await factoryFn.prepareSearch();
        expect(factoryFn.shipmentFilters).to.eql({
          status: { $in: ["draft"] }
        });
      });
      it("plannerMeFilter filter", async function() {
        const view = { ...viewDoc, filters: { "planner-me": {} } };
        const factoryFn = shipmentOverViewAggregation({
          userId,
          accountId,
          view,
          start: 0,
          length: 20
        });

        await factoryFn.prepareSearch();
        expect(factoryFn.shipmentFilters.plannerIds).to.equal(userId);
      });
      it("hasPriceRequestFilter", async function() {
        const view = { ...viewDoc, filters: { hasPriceRequest: {} } };
        const factoryFn = shipmentOverViewAggregation({
          userId,
          accountId,
          view,
          start: 0,
          length: 20
        });

        await factoryFn.prepareSearch();
        expect(factoryFn.shipmentFilters.priceRequestId).to.eql({
          $exists: true
        });
      });
      it("hasProjectFilter", async function() {
        const view = { ...viewDoc, filters: { hasProject: {} } };
        const factoryFn = shipmentOverViewAggregation({
          userId,
          accountId,
          view,
          start: 0,
          length: 20
        });

        await factoryFn.prepareSearch();
        expect(factoryFn.shipmentFilters).to.deep.include({
          $or: [
            { shipmentProjectInboundId: { $exists: true } },
            { shipmentProjectOutboundId: { $exists: true } }
          ]
        });
      });
      it("locationFilter", async function() {
        const view = {
          ...viewDoc,
          filters: { pickup: { location: { countryCode: "BE" } } }
        };
        const factoryFn = shipmentOverViewAggregation({
          userId,
          accountId,
          view,
          start: 0,
          length: 20
        });

        await factoryFn.prepareSearch();
        expect(factoryFn.shipmentFilters).to.deep.include({
          "pickup.location.countryCode": "BE"
        });
      });
      it("shipperFilter", async function() {
        const view = {
          ...viewDoc,
          filters: { shipper: { values: ["shipper1", "shipper2"] } }
        };
        const factoryFn = shipmentOverViewAggregation({
          userId,
          accountId,
          view,
          start: 0,
          length: 20
        });

        await factoryFn.prepareSearch();
        expect(factoryFn.shipmentFilters.shipperId).to.eql({
          $in: ["shipper1", "shipper2"]
        });
      });
      it("consigneeFilter", async function() {
        const view = {
          ...viewDoc,
          filters: { consignee: { values: ["shipper1", "shipper2"] } }
        };
        const factoryFn = shipmentOverViewAggregation({
          userId,
          accountId,
          view,
          start: 0,
          length: 20
        });

        await factoryFn.prepareSearch();
        expect(factoryFn.shipmentFilters.consigneeId).to.eql({
          $in: ["shipper1", "shipper2"]
        });
      });
      it("carrierFilter", async function() {
        const view = {
          ...viewDoc,
          filters: { carrier: { values: ["carrier1", "carrier2"] } }
        };
        const factoryFn = shipmentOverViewAggregation({
          userId,
          accountId,
          view,
          start: 0,
          length: 20
        });

        await factoryFn.prepareSearch();
        expect(factoryFn.shipmentFilters.carrierIds).to.eql({
          $in: ["carrier1", "carrier2"]
        });
      });
    });
    describe("shipment-projections", function() {
      it("hasPriceRequest", async function() {
        const view = { ...viewDoc };
        view.columns = [...viewDoc.columns, "shipment.hasPriceRequest"];
        const factoryFn = shipmentOverViewAggregation({
          userId,
          accountId,
          view,
          start: 0,
          length: 20
        });

        await factoryFn.prepareSearch();
        expect(factoryFn.shipmentProjections.hasPriceRequest).to.eql({
          $gt: ["$priceRequestId", null]
        });
      });
      it("plannerMe", async function() {
        const view = { ...viewDoc };
        view.columns = [...viewDoc.columns, "planner-me"];
        const factoryFn = shipmentOverViewAggregation({
          userId,
          accountId,
          view,
          start: 0,
          length: 20
        });

        await factoryFn.prepareSearch();
        expect(factoryFn.shipmentProjections["planner-me"]).to.eql({
          $cond: {
            if: { $eq: ["$plannerIds", USER_ID] },
            then: true,
            else: false
          }
        });
      });
      it("hasProject", async function() {
        const view = { ...viewDoc };
        view.columns = [...viewDoc.columns, "shipment.hasProject"];

        const factoryFn = shipmentOverViewAggregation({
          userId,
          accountId,
          view,
          start: 0,
          length: 20
        });

        await factoryFn.prepareSearch();
        expect(factoryFn.shipmentProjections.hasProject).to.eql({
          $or: [
            { $gt: ["$shipmentProjectInboundId", null] },
            { $gt: ["$shipmentProjectOutboundId", null] }
          ]
        });
      });
      it("carrierIds", async function() {
        const view = { ...viewDoc };
        view.columns = [...viewDoc.columns, "partners.carriers"];

        const factoryFn = shipmentOverViewAggregation({
          userId,
          accountId,
          view,
          start: 0,
          length: 20
        });

        await factoryFn.prepareSearch();
        expect(factoryFn.shipmentProjections.carrierIds).to.equal(1);
      });
      it("shipperId", async function() {
        const view = { ...viewDoc };
        view.columns = [...viewDoc.columns, "partners.shipper"];

        const factoryFn = shipmentOverViewAggregation({
          userId,
          accountId,
          view,
          start: 0,
          length: 20
        });

        await factoryFn.prepareSearch();
        expect(factoryFn.shipmentProjections.shipperId).to.equal(1);
      });
      it("consigneeId", async function() {
        const view = { ...viewDoc };
        view.columns = [...viewDoc.columns, "partners.consignee"];

        const factoryFn = shipmentOverViewAggregation({
          userId,
          accountId,
          view,
          start: 0,
          length: 20
        });

        await factoryFn.prepareSearch();
        expect(factoryFn.shipmentProjections.consigneeId).to.equal(1);
      });
      it("shipmentCosts", async function() {
        const view = { ...viewDoc };
        view.columns = [...viewDoc.columns, "costs.delta"];

        const factoryFn = shipmentOverViewAggregation({
          userId,
          accountId,
          view,
          start: 0,
          length: 20
        });

        await factoryFn.prepareSearch();
        expect(factoryFn.shipmentProjections.costs).to.not.equal(undefined);
      });
      it("references", async function() {
        const view = { ...viewDoc };
        view.columns = [...viewDoc.columns, "references.number"];

        const factoryFn = shipmentOverViewAggregation({
          userId,
          accountId,
          view,
          start: 0,
          length: 20
        });

        await factoryFn.prepareSearch();
        expect(factoryFn.shipmentProjections.references).to.equal(1);
      });
    });
  });
  describe("dateFilters", function() {
    it("creates a dateFilter", function() {
      const view = { ...viewDoc };
      view.filters = { "pickup-arrival-planned": { period: "-d" } };

      const factoryFn = shipmentOverViewAggregation({
        userId,
        accountId,
        view,
        start: 0,
        length: 20
      });

      factoryFn.applyDateFilters();

      expect(
        factoryFn.pipeline[0].$match["dates.pickup-arrival-planned.value"]
      ).to.not.equal(undefined);
    });
  });

  describe("getPagedShipmentOverview", function() {
    const context = {
      userId: USER_ID,
      accountId: ACCOUNT_ID
    };
    beforeEach(async function() {
      await resetCollections(["shipmentsViews", "shipments"]);
    });
    it("retrieves shipment in overview", async function() {
      // user has entities: ENT1, ENT2, LON

      await ShipmentsView._collection.update(
        { _id: SHIPMENT_VIEW_ID },
        { $addToSet: { columns: "entities" }, $set: { direct: true } }
      );

      const args = {
        input: {
          viewId: SHIPMENT_VIEW_ID,
          jobId: null,
          start: null,
          length: null,
          sort: null
        }
      };
      const res = await resolvers.Query.getPagedShipmentOverview(
        null,
        args,
        context
      );

      expect(res.recordsTotal).to.equal(5);
      expect(res.recordsFiltered).to.equal(5);
    });
    it("retrieves shipment in overview with entity filter", async function() {
      // user has entities: ENT1, ENT2, LON

      await ShipmentsView._collection.update(
        { _id: SHIPMENT_VIEW_ID },
        {
          $addToSet: { columns: "entities" },
          $set: {
            direct: true,
            filters: {
              status: {
                values: [
                  "started",
                  "draft",
                  "partial",
                  "planned",
                  "scheduled",
                  "completed"
                ]
              },
              entities: {
                values: ["ENT2"]
              }
            }
          }
        }
      );

      const args = {
        input: {
          viewId: SHIPMENT_VIEW_ID,
          jobId: null,
          start: null,
          length: null,
          sort: null
        }
      };
      const res = await resolvers.Query.getPagedShipmentOverview(
        null,
        args,
        context
      );

      expect(res.recordsTotal).to.equal(1);
      expect(res.recordsFiltered).to.equal(1);
    });
    it("retrieves shipment in overview - user without entities", async function() {
      // user has no entities

      await Shipment._collection.update(
        { accountId: ACCOUNT_ID },
        { $set: { status: "draft", shipperId: "S11111", access: [] } },
        { mutli: true }
      );
      await ShipmentsView._collection.update(
        { _id: SHIPMENT_VIEW_ID },
        {
          $addToSet: { columns: "entities.code" },
          $set: { direct: true }
        }
      );
      const args = {
        input: {
          viewId: SHIPMENT_VIEW_ID,
          jobId: null,
          start: null,
          length: null,
          sort: null
        }
      };
      const res = await resolvers.Query.getPagedShipmentOverview(null, args, {
        accountId: ACCOUNT_ID,
        userId: USER_WITHOUT_ENTITIES
      });

      expect(res.recordsTotal).to.equal(3);
      expect(res.recordsFiltered).to.equal(3);
    });
    it("retrieves shipment in overview - assigned carrier without entities", async function() {
      // expected shipments:
      // shipment: Liy2zt3cqqymTKtfj | carrier | completed
      const EXPECTED_SHIPMENT_ID = "Liy2zt3cqqymTKtfj";

      await Shipment._collection.update(
        { accountId: ACCOUNT_ID },
        { $set: { access: [] } },
        { multi: true }
      );
      await ShipmentsView._collection.update(
        { _id: SHIPMENT_VIEW_ID },
        {
          $addToSet: { columns: "entities.code" },
          $set: { direct: true } // to bupass the buffer
        }
      );
      const args = {
        input: {
          viewId: SHIPMENT_VIEW_ID,
          jobId: null,
          start: null,
          length: null,
          sort: null
        }
      };
      const res = await resolvers.Query.getPagedShipmentOverview(null, args, {
        accountId: CARRIER_ACCOUNT_ID,
        userId: CARRIER_USER_ID
      });

      expect(res.recordsTotal).to.equal(1);
      expect(res.recordsFiltered).to.equal(1);
      expect(res.data[0]._id).to.equal(EXPECTED_SHIPMENT_ID);
    });
    it("retrieves shipment in overview - assigned carrier with entities", async function() {
      // expected shipments:
      // shipment: Liy2zt3cqqymTKtfj | carrier | completed
      const EXPECTED_SHIPMENT_ID = "Liy2zt3cqqymTKtfj";

      await Shipment._collection.update(
        { accountId: ACCOUNT_ID },
        { $set: { access: [] } },
        { multi: true }
      );
      await ShipmentsView._collection.update(
        { _id: SHIPMENT_VIEW_ID },
        {
          $addToSet: { columns: "entities.code" },
          $set: { direct: true } // to bupass the buffer
        }
      );
      const args = {
        input: {
          viewId: SHIPMENT_VIEW_ID,
          jobId: null,
          start: null,
          length: null,
          sort: null
        }
      };
      const res = await resolvers.Query.getPagedShipmentOverview(null, args, {
        accountId: CARRIER_ACCOUNT_ID,
        userId: USER_ID // this one has entities
      });

      expect(res.recordsTotal).to.equal(1);
      expect(res.recordsFiltered).to.equal(1);
      expect(res.data[0]._id).to.equal(EXPECTED_SHIPMENT_ID);
    });
    it("retrieves shipment in overview - assigned shipper with entities", async function() {
      // expected shipments:
      const EXPECTED_SHIPMENT_ID = "Liy2zt3cqqymTKtfj";

      await Shipment._collection.update(
        { _id: EXPECTED_SHIPMENT_ID },
        { $set: { shipperId: SHIPPER_ACCOUNT_ID, access: [] } }
      );
      await ShipmentsView._collection.update(
        { _id: SHIPMENT_VIEW_ID },
        {
          $addToSet: { columns: "entities.code" },
          $set: { direct: true } // to bupass the buffer
        }
      );
      const args = {
        input: {
          viewId: SHIPMENT_VIEW_ID,
          jobId: null,
          start: null,
          length: null,
          sort: null
        }
      };
      const res = await resolvers.Query.getPagedShipmentOverview(null, args, {
        accountId: SHIPPER_ACCOUNT_ID,
        userId: USER_ID // this one has entities
      });

      expect(res.recordsTotal).to.equal(1);
      expect(res.recordsFiltered).to.equal(1);
      expect(res.data[0]._id).to.equal(EXPECTED_SHIPMENT_ID);
    });
    it("retrieves shipment in overview - assigned shipper without entities", async function() {
      // expected shipments:
      const EXPECTED_SHIPMENT_ID = "Liy2zt3cqqymTKtfj";

      await Shipment._collection.update(
        { _id: EXPECTED_SHIPMENT_ID },
        { $set: { shipperId: SHIPPER_ACCOUNT_ID, access: [] } }
      );
      await ShipmentsView._collection.update(
        { _id: SHIPMENT_VIEW_ID },
        {
          $addToSet: { columns: "entities.code" },
          $set: { direct: true } // to bupass the buffer
        }
      );
      const args = {
        input: {
          viewId: SHIPMENT_VIEW_ID,
          jobId: null,
          start: null,
          length: null,
          sort: null
        }
      };
      const res = await resolvers.Query.getPagedShipmentOverview(null, args, {
        accountId: SHIPPER_ACCOUNT_ID,
        userId: SHIPPER_USER_ID
      });

      expect(res.recordsTotal).to.equal(1);
      expect(res.recordsFiltered).to.equal(1);
      expect(res.data[0]._id).to.equal(EXPECTED_SHIPMENT_ID);
    });
    it("retrieves shipment in overview - through access settings", async function() {
      // expected shipments:
      // shipment: Liy2zt3cqqymTKtfj | carrier | completed
      const EXPECTED_SHIPMENT_ID = "Liy2zt3cqqymTKtfj";

      await Shipment._collection.update(
        { _id: EXPECTED_SHIPMENT_ID },
        {
          $set: {
            access: [
              {
                accountId: SHIPPER_ACCOUNT_ID,
                action: "priceRequest",
                id: "zgSR5RRWJoHMDSEDy"
              }
            ]
          }
        }
      );
      await ShipmentsView._collection.update(
        { _id: SHIPMENT_VIEW_ID },
        {
          $addToSet: { columns: "entities.code" },
          $set: { direct: true } // to bupass the buffer
        }
      );
      const args = {
        input: {
          viewId: SHIPMENT_VIEW_ID,
          jobId: null,
          start: null,
          length: null,
          sort: null
        }
      };
      const res = await resolvers.Query.getPagedShipmentOverview(null, args, {
        accountId: SHIPPER_ACCOUNT_ID,
        userId: SHIPPER_USER_ID
      });

      expect(res.recordsTotal).to.equal(1);
      expect(res.recordsFiltered).to.equal(1);
      expect(res.data[0]._id).to.equal(EXPECTED_SHIPMENT_ID);
    });
  });

  describe("getPagedShipmentOverview-GBQ", function() {
    it("retrieves shipment in overview - user without entities from BQ", async function() {
      // user has no entities

      await Shipment._collection.update(
        { accountId: ACCOUNT_ID },
        { $set: { status: "draft", shipperId: "S11111", access: [] } }
      );
      await ShipmentsView._collection.update(
        { _id: SHIPMENT_VIEW_ID },
        {
          $addToSet: { columns: "entities.code" },
          $set: { direct: true, shipmentOverviewType: "GBQ" }
        }
      );
      const args = {
        input: {
          viewId: SHIPMENT_VIEW_ID,
          jobId: null,
          start: null,
          length: null,
          sort: null
        }
      };
      const res = await resolvers.Query.getPagedShipmentOverview(null, args, {
        accountId: ACCOUNT_ID,
        userId: USER_WITHOUT_ENTITIES
      });

      expect(res.recordsTotal).to.equal(1);

      expect(res.sql).to.include("( entity IN ('') OR entity IS NULL )");
    });

    it("retrieves shipment in overview - view with entity from BQ", async function() {
      // user has no entities
      await ShipmentsView._collection.update(
        { _id: SHIPMENT_VIEW_ID },
        {
          $addToSet: { columns: "entities" },
          $set: {
            direct: true,
            shipmentOverviewType: "GBQ",
            filters: {
              status: {
                values: [
                  "started",
                  "draft",
                  "partial",
                  "planned",
                  "scheduled",
                  "completed"
                ]
              },
              entities: {
                values: ["ENT2"]
              }
            }
          }
        }
      );
      await Shipment._collection.update(
        { accountId: ACCOUNT_ID },
        { $set: { status: "draft", shipperId: "S11111", access: [] } }
      );

      const args = {
        input: {
          viewId: SHIPMENT_VIEW_ID,
          jobId: null,
          start: null,
          length: null,
          sort: null
        }
      };
      const res = await resolvers.Query.getPagedShipmentOverview(null, args, {
        accountId: ACCOUNT_ID,
        userId: USER_ID
      });

      expect(res.recordsTotal).to.equal(1);
      debug("result of query %s", res.sql);
      expect(res.sql).to.include("( entity IN ('ENT2') )");
    });
  });
});
