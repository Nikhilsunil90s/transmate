/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
import { expect } from "chai";
import get from "lodash.get";
import { priceListdocRoad, priceListRateDocsRoad } from "./gridDataRoad";
import { priceListdocOcean } from "./gridDataOcean";
import { priceListRateDocsOcean } from "./gridDataOcean-rates";
import { priceListdocSpot } from "./gridDataSpot";
import { priceListRateDocsSpot } from "./gridDataSpot-rates";

import { PriceListUICore } from "/imports/utils/priceList/grid__class_core";
import { getGridData } from "/imports/utils/priceList/grid_getData";
import { afterChangeHandler } from "/imports/utils/priceList/grid_afterChangeHandler";

const ACCOUNT_ID = "S65957";

const i18nMock = i18nKey => i18nKey;

describe("priceList grid", function() {
  describe("[Grid][road] template grid", function() {
    let grid;
    beforeEach(function() {
      //
      grid = new PriceListUICore(
        {
          ...priceListdocRoad,
          id: priceListdocRoad._id, // needed for priceListId in class
          customerId: ACCOUNT_ID,
          creatorId: ACCOUNT_ID
        },
        null,
        i18nMock
      );
    });
    it("loads the road grid from the data", function() {
      // check structure:
      expect(grid.gridrowsKeys).to.have.lengthOf(4); // 1x multiplier field + 3 * lanes
      expect(grid.gridcolsKeys).to.have.lengthOf(6); // 6 volumeRangeIds
      expect(grid.pageFilters).to.have.lengthOf(1); // 1 page filter defined (volume Groups)

      // check blank data load:
      grid.initializeData();
      expect(grid.base).to.have.lengthOf(4); // 4 rows
      expect(grid.base[0]).to.have.lengthOf(6); // 6 cols

      // loading real db data
      // we mock the client call, and inject the data
      getGridData.apply(grid, [{ rates: priceListRateDocsRoad, stats: {} }]);

      // first row is a header row
      expect(grid.base[0][0]).to.not.equal(undefined);
      expect(grid.base[0][0]).to.be.an("object");
      expect(grid.base[0][0].field).to.equal("multiplier");
      expect(grid.base[0][0].isHeader).to.equal(true);

      expect(grid.base[1][0]).to.not.equal(undefined);
      expect(grid.base[1][0]).to.be.an("object");
      expect(grid.base[1][0].laneId).to.equal("hXYFod");
    });
    it("allows me to add data in an empty cell", function() {
      grid.initializeData(); // provides an empty grid

      // testing through manually calling the after change function
      // same as afterChangeHandler of UI
      // test update cell row 1, col 0 -> is empty value -> so we a selector
      const ROW = 1;
      const COL = 0;
      const changes = [[ROW, COL, null, { value: 10000, unit: "USD" }]]; // [row, col, oldValue, newValue]
      const updates = changes.map(change => {
        return afterChangeHandler({ change, grid })
          .checkPermissions()
          .initializeData()
          .checkIfHeader()
          .getUpdate();
      });

      expect(updates[0].selector.rules).to.be.an("object");
      expect(updates[0].selector.rules).to.eql({
        laneId: "hXYFod",
        volumeGroupId: "QC4qok",
        volumeRangeId: "tcYNFt"
      });

      expect(updates[0].update.amount).to.be.an("object");
      expect(updates[0].update.amount).to.eql({ value: 10000, unit: "USD" });

      // TODO make test to see what comes out if only these are passed in the upsert function
    });

    it("loads the road grid from the data", function() {
      grid.initializeData(); // provides an empty grid

      // loading real db data
      // we mock the client call, and inject the data
      getGridData.apply(grid, [{ rates: priceListRateDocsRoad, stats: {} }]);

      // testing through manually calling the after change function
      // same as afterChangeHandler of UI
      // test update cell row 1, col 0 -> is empty value -> so we a selector
      const ROW = 1;
      const COL = 0;
      const changes = [[ROW, COL, 5.9, { value: 100, unit: "EUR" }]]; // [row, col, oldValue, newValue]
      const updates = changes.map(change => {
        return afterChangeHandler({ change, grid })
          .checkPermissions()
          .initializeData()
          .checkIfHeader()
          .getUpdate();
      });

      // check the update:
      const update = get(updates, [0]);

      expect(update.selector).eql({
        rules: {
          laneId: "hXYFod",
          volumeGroupId: "QC4qok",
          volumeRangeId: "tcYNFt"
        }
      });
      expect(update.update.amount.value).to.equal(100);
    });
  });

  describe("[Grid][Ocean] template grid", function() {
    let grid;
    beforeEach(function() {
      grid = new PriceListUICore(
        {
          ...priceListdocOcean,
          id: priceListdocOcean._id, // needed for priceListId in class
          customerId: ACCOUNT_ID,
          creatorId: ACCOUNT_ID
        },
        null,
        i18nMock
      );
    });
    it("loads the ocean grid from the data", function() {
      // check structure:
      expect(grid.gridrowsKeys).to.have.lengthOf(28); // 28 charges
      expect(grid.gridcolsKeys).to.have.lengthOf(4); // 1x multiplier field + 3 * equipment
      expect(grid.pageFilters).to.have.lengthOf(1); // 1 page filter defined (volume Groups)

      // check blank data load:
      grid.initializeData();
      expect(grid.base).to.have.lengthOf(28); // 28 rows
      expect(grid.base[0]).to.have.lengthOf(4); // 4 cols

      // get data (mock)
      getGridData.apply(grid, [{ rates: priceListRateDocsOcean, stats: {} }]);

      // first row is a header row
      expect(grid.base[0][0]).to.not.equal(undefined);
      expect(grid.base[0][0]).to.be.an("object");
      expect(grid.base[0][0].field).to.equal("amount.unit");
      expect(grid.base[0][0].isHeader).to.equal(true);

      expect(grid.base[2][2]).to.not.equal(undefined);
      expect(grid.base[2][2]).to.be.an("object");
      expect(grid.base[2][2].laneId).to.equal("k6CyGL");
      expect(grid.base[2][2].rules).to.have.lengthOf(2);
    });

    it("allows me to remove data from a cell", function() {
      grid.initializeData(); // provides an empty grid

      // get data (mock)
      getGridData.apply(grid, [{ rates: priceListRateDocsOcean, stats: {} }]);

      // testing through manually calling the after change function
      // same as afterChangeHandler of UI
      // test update cell row 1, col 0 -> is empty value -> so we a selector
      const ROW = 2;
      const COL = 2;
      const changes = [[ROW, COL, null, ""]]; // [row, col, oldValue, newValue]
      const updates = changes.map(change => {
        return afterChangeHandler({ change, grid })
          .checkPermissions()
          .initializeData()
          .checkIfHeader()
          .getUpdate();
      });

      // check the update:
      const { selector } = updates[0];
      const { update } = updates[0];

      expect(selector).to.eql({
        rules: { equipmentGroupId: "5jWjnb", laneId: "k6CyGL" },
        rulesUI: { chargeId: "yQRMijAzqNJxpstDD" }
      });
      expect(update).to.equal(null);
    });

    it("allows me to add data in an empty cell", function() {
      grid.initializeData(); // provides an empty grid

      getGridData.apply(grid, [{ rates: [], stats: {} }]);

      // testing through manually calling the after change function
      // same as afterChangeHandler of UI
      // test update cell row 1, col 0 -> is empty value -> so we a selector
      const ROW = 2;
      const COL = 2;
      const changes = [[ROW, COL, null, { value: 100, unit: "TWD" }]]; // [row, col, oldValue, newValue]
      const updates = changes.map(change => {
        return afterChangeHandler({ change, grid })
          .checkPermissions()
          .initializeData()
          .checkIfHeader()
          .getUpdate();
      });

      // .filter(update => !!update)
      // .flat();

      // check the update:
      const { selector } = updates[0];
      const { update } = updates[0];

      expect(selector).to.eql({
        rules: { equipmentGroupId: "5jWjnb", laneId: "k6CyGL" },
        rulesUI: { chargeId: "yQRMijAzqNJxpstDD" }
      });
      expect(update).to.eql({
        amount: {
          unit: "TWD",
          value: 100
        },
        costId: "6j29iWhqLXxpbgbj6",
        laneId: "k6CyGL",
        meta: { source: "table" },
        multiplier: "equipment",
        name: "Origin Export Customs",
        priceListId: "46QvPxktg4WBXgHjx",
        rules: [{ equipmentGroupId: "5jWjnb" }, { laneId: "k6CyGL" }],
        rulesUI: { chargeId: "yQRMijAzqNJxpstDD" },
        type: "calculated"
      });
    });

    it("allows me to add data in a filled cell", function() {
      grid.initializeData(); // provides an empty grid

      // get data (mock)
      getGridData.apply(grid, [{ rates: priceListRateDocsOcean, stats: {} }]);

      // testing through manually calling the after change function
      // same as afterChangeHandler of UI
      // test update cell row 1, col 0 -> is empty value -> so we a selector
      const ROW = 2;
      const COL = 2;
      const changes = [[ROW, COL, 1034, { value: 100, unit: "EUR" }]]; // [row, col, oldValue, newValue]
      const updates = changes.map(change => {
        return afterChangeHandler({ change, grid })
          .checkPermissions()
          .initializeData()
          .checkIfHeader()
          .getUpdate();
      });

      // .filter(update => !!update)
      // .flat();

      // check the update:
      const { selector } = updates[0];
      const { update } = updates[0];

      expect(selector).to.eql({
        rules: { equipmentGroupId: "5jWjnb", laneId: "k6CyGL" },
        rulesUI: { chargeId: "yQRMijAzqNJxpstDD" }
      });
      expect(update.amount.value).to.equal(100);
    });
  });

  describe("[Grid][spot] template grid", function() {
    let grid;
    beforeEach(function() {
      //
      grid = new PriceListUICore(
        {
          ...priceListdocSpot,
          id: priceListdocSpot._id, // needed for priceListId in class
          customerId: ACCOUNT_ID,
          creatorId: ACCOUNT_ID
        },
        null,
        i18nMock
      );
    });
    it("loads the spot grid from the data", function() {
      // important is that shipmentId is present in keys.
      // check structure:
      expect(grid.gridrowsKeys).to.have.lengthOf(3); // 1 x currency + 2 lanes
      expect(grid.gridcolsKeys).to.have.lengthOf(9); // 6 x meta field + 3 * charge
      expect(grid.pageFilters).to.have.lengthOf(0); // no page filter defined

      // check blank data load:
      grid.initializeData();
      expect(grid.base).to.have.lengthOf(3); // 3 rows
      expect(grid.base[0]).to.have.lengthOf(9); // 11 cols

      // loading real db data
      // we mock the client call, and inject the data
      getGridData.apply(grid, [{ rates: priceListRateDocsSpot, stats: {} }]);

      // attribute fields should be filled with reference data:
      expect(get(grid, ["base", 1, 0, "field"])).to.equal("fromCC");
      expect(get(grid, ["base", 1, 0, "value"])).to.equal("BE");
      expect(get(grid, ["base", 1, 1, "field"])).to.equal("fromZone");
      expect(get(grid, ["base", 1, 1, "value"])).to.equal("3980");
      expect(get(grid, ["base", 1, 2, "field"])).to.equal("toCC");
      expect(get(grid, ["base", 1, 2, "value"])).to.equal("NL");

      expect(get(grid, ["base", 1, 8])).to.eql({
        _id: "tKriCZxRiHQBCZ8ZD",
        type: "calculated",
        costId: "2oCaqqYeje5kps2Si",

        // laneId: null,
        multiplier: "shipment",
        amount: { value: 100 },
        name: "road tax",
        meta: { source: "table" },
        rules: [{ shipmentId: "zsjtZz7fn8hAimx7T" }],
        currency: "EUR",
        rulesUI: { chargeId: "z3G9DwtDfKmhSiNWy" },
        priceListId: "QgEDbGepecvQxXf2Y",
        fieldType: "rate"
      });
    });

    it("allows me to add data in an empty cell", function() {
      grid.initializeData(); // provides an empty grid
      getGridData.apply(grid, [{ rates: [], stats: {} }]);

      // testing through manually calling the after change function
      // same as afterChangeHandler of UI
      // test update cell row 1, col 0 -> is empty value -> so we a selector
      const ROW = 1;
      const COL = 8;
      const changes = [[ROW, COL, null, { value: 100, unit: "EUR" }]]; // [row, col, oldValue, newValue]
      const updates = changes.map(change => {
        return afterChangeHandler({ change, grid })
          .checkPermissions()
          .initializeData()
          .checkIfHeader()
          .getUpdate();
      });

      // .filter(update => !!update)
      // .flat();

      // check the update:
      const { selector, update } = updates[0];

      expect(selector).to.eql({
        rules: { shipmentId: "zsjtZz7fn8hAimx7T" },
        rulesUI: {
          chargeId: "z3G9DwtDfKmhSiNWy"
        }
      });

      expect(update).to.eql({
        amount: { unit: "EUR", value: 100 },
        type: "calculated",
        costId: "2oCaqqYeje5kps2Si",
        laneId: null,
        multiplier: "shipment",
        name: "road tax",
        meta: { source: "table" },
        rules: [{ shipmentId: "zsjtZz7fn8hAimx7T" }],
        rulesUI: {
          chargeId: "z3G9DwtDfKmhSiNWy"
        },
        priceListId: "QgEDbGepecvQxXf2Y"
      });
    });

    it("allows me to add data in a filled cell", function() {
      grid.initializeData(); // provides an empty grid

      // loading real db data
      // we mock the client call, and inject the data
      getGridData.apply(grid, [{ rates: priceListRateDocsSpot, stats: {} }]);

      // testing through manually calling the after change function
      // same as afterChangeHandler of UI
      // test update cell row 1, col 0 -> is empty value -> so we a selector
      const ROW = 1;
      const COL = 8;
      const changes = [[ROW, COL, 100, { value: 200, unit: "EUR" }]]; // [row, col, oldValue, newValue]
      const updates = changes.map(change => {
        return afterChangeHandler({ change, grid })
          .checkPermissions()
          .initializeData()
          .checkIfHeader()
          .getUpdate();
      });

      // .filter(update => !!update)
      // .flat();

      // check the update:
      const { selector, update } = updates[0];

      expect(selector).to.eql({
        rules: { shipmentId: "zsjtZz7fn8hAimx7T" },
        rulesUI: { chargeId: "z3G9DwtDfKmhSiNWy" }
      });
      expect(update.amount.value).to.equal(200);
    });
  });
});
