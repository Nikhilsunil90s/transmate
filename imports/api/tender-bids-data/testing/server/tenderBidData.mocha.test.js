/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
import { Meteor } from "meteor/meteor";

// import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection";
import { expect } from "chai";
import get from "lodash.get";
import { resolvers } from "../../apollo/resolvers";

import { evaluateFormula } from "../../services/evaluateFormula";
import { GetCalculationRefValues } from "../../services/getCalculationRefValues";

import { TenderBidDataMeta } from "../../TenderBidDataMeta";
import { TenderBidDataChanges } from "../../TenderBidDataChanges";
import { TenderBidData } from "../../TenderBidData";

const debug = require("debug")("tenderify:test");

const ACCOUNT_ID = "S65957";
const USER_ID = "jsBor6o3uRBTFoRQY";

const TENDER_BID_ID = "ekLwjhFL2haYJpjXw";
const TENDER_BID_ID2 = "GnxFJFZfYyFdMTT9K";
const LINE_ID = "dae78f252f8291c6b585c16d93a0c974b1e4db3a";
const PRICE_LIST_ID = "3ecjkjCcskEJph8PP";

let defaultMongo;
describe("tenderify-data", function() {
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
      "tenderBid",
      "tenderBidMapping",
      "tenderBidData",
      "tenderBidMeta"
    ]);
    if (!resetDone) throw Error("reset was not possible, test can not run!");
    Meteor.setUserId && Meteor.setUserId(USER_ID);
  });
  describe("resolvers", function() {
    const context = { accountId: ACCOUNT_ID, userId: USER_ID };
    beforeEach(async function() {
      const resetDone = await resetCollections([
        "tenderBid",
        "tenderBidMapping",
        "tenderBidData",
        "tenderBidMeta"
      ]);
      return resetDone;
    });
    it("[getTenderBidDataGrid] returns data", async function() {
      // getTenderBidDataGrid(input: getTenderBidDataGridInput!)
      const args = {
        input: {
          tenderBidId: TENDER_BID_ID,
          query: {}
        }
      };
      const res = await resolvers.Query.getTenderBidDataGrid(
        null,
        args,
        context
      );

      expect(res).to.not.equal(undefined);
      expect(res.id).to.equal(args.input.tenderBidId);
      expect(res.headerDefs).to.be.an("array");
      expect(res.data).to.be.an("array");
      expect(res.data[0].rowData).to.not.equal(undefined);
      expect(res.data[0].rowData["main/currency"]).to.equal("EUR");

      // projection of object:
      expect(res.data[0].rowData["main/fuel"].amount).to.be.a("object");

      // expect(res.data[0].rowData["main/freight"].amount.value).to.be.a(
      //   "string"
      // );
    });
    it("[updateTenderBidDataGrid] returns data", async function() {
      const originalDataEntry = await TenderBidData.first(
        {
          tenderBidId: TENDER_BID_ID2,
          "volumeDescription.mapping": "11.001_to_12_ton"
        },
        { fields: { _id: 0, lineId: 1 } }
      );

      // getTenderBidDataGrid(input: getTenderBidDataGridInput!)
      const args = {
        input: {
          tenderBidId: TENDER_BID_ID2,
          updates: [
            {
              newValue: "newValue",
              cKey: "lanesId",
              lineId: originalDataEntry.lineId,
              colKey: "lanesId.mapping"
            }
          ]
        }
      };
      const res = await resolvers.Mutation.updateTenderBidDataGrid(
        null,
        args,
        context
      );

      expect(res).to.not.equal(undefined);
      expect(res).to.be.an("array");
      expect(res).to.have.lengthOf(1);
      expect(res[0].lineId).to.equal(originalDataEntry.lineId);
      expect(res[0].rowData.lanesId).to.equal("newValue");
    });
    it("[updateTenderBidDataGrid][fillOut] no formula", async function() {
      const originalDataEntry = await TenderBidData.first(
        {
          tenderBidId: TENDER_BID_ID2,
          "volumeDescription.mapping": "11.001_to_12_ton",
          "main/freight.chargeValue.mapping": 60.25
        },
        { fields: { _id: 0, lineId: 1 } }
      );

      const args = {
        input: {
          tenderBidId: TENDER_BID_ID2,
          updates: [
            {
              newValue: { amount: { value: 120, currency: "EUR" } },
              lineId: originalDataEntry.lineId,
              colKey: "main/freight",
              cType: "fillOut"
            }
          ]
        }
      };
      await resolvers.Mutation.updateTenderBidDataGrid(null, args, context);

      const testDoc = await TenderBidData.first(
        { tenderBidId: TENDER_BID_ID2, lineId: originalDataEntry.lineId },
        { fields: { _id: 0 } }
      );

      expect(testDoc).to.not.equal(undefined);
      expect(get(testDoc, ["main/freight", "chargeValue", "mapping"])).to.equal(
        120
      );
      expect(get(testDoc, ["main/freight", "chargeValue", "formula"])).to.equal(
        null
      );

      // TODO > check for stat columns & other formulas
    });
    it("[updateTenderBidDataGrid][fillOut] with formula", async function() {
      const originalDataEntry = await TenderBidData.first(
        {
          tenderBidId: TENDER_BID_ID2,
          "volumeDescription.mapping": "11.001_to_12_ton",
          "main/freight.chargeValue.mapping": 60.25
        },
        { fields: { _id: 0, lineId: 1 } }
      );
      debug("line id %o", originalDataEntry.lineId);
      const args = {
        input: {
          tenderBidId: TENDER_BID_ID2,
          updates: [
            {
              newValue: {
                amount: { value: 120, currency: "EUR" },
                formula: "([base_rate_EUR]) * [to_ton]"
              },
              lineId: originalDataEntry.lineId,
              colKey: "main/freight",
              cType: "fillOut"
            }
          ]
        }
      };
      await resolvers.Mutation.updateTenderBidDataGrid(null, args, context);

      const testDoc = await TenderBidData.first(
        { tenderBidId: TENDER_BID_ID2, lineId: originalDataEntry.lineId },
        { fields: { _id: 0 } }
      );

      // should: update both formula and value & register the calculation column
      expect(testDoc).to.not.equal(undefined);
      expect(testDoc["main/freight"]).to.be.an("object");
      expect(get(testDoc, ["main/freight", "chargeValue", "mapping"])).to.equal(
        60.25
      );
      expect(get(testDoc, ["main/freight", "chargeValue", "formula"])).to.equal(
        args.input.updates[0].newValue.formula
      );

      const testIfFormulaIsRegistered = get(
        testDoc,
        ["calculation", "formulaColumns"],
        []
      ).find(({ colKey }) => colKey === "main/freight.chargeValue");
      expect(testIfFormulaIsRegistered).to.not.equal(undefined);

      // TODO > check for stat columns & other formulas
    });
    it("[updateTenderBidDataGrid][calculationCharge] no formula", async function() {
      const originalDataEntry = await TenderBidData.first(
        {
          tenderBidId: TENDER_BID_ID2,
          "volumeDescription.mapping": "11.001_to_12_ton"
        },
        { fields: { _id: 0, lineId: 1 } }
      );

      const args = {
        input: {
          tenderBidId: TENDER_BID_ID2,
          updates: [
            {
              newValue: {
                amount: { value: 120 }
              },
              lineId: originalDataEntry.lineId,
              colKey: "calculation.main.base_rate_EUR",
              cType: "calculationCharge"
            }
          ]
        }
      };
      await resolvers.Mutation.updateTenderBidDataGrid(null, args, context);

      const testDoc = await TenderBidData.first(
        { tenderBidId: TENDER_BID_ID2, lineId: originalDataEntry.lineId },
        { fields: { _id: 0 } }
      );

      // should: update both formula and value & register the calculation column
      expect(testDoc).to.not.equal(undefined);
      expect(
        get(testDoc, "calculation.main.base_rate_EUR.amount.value")
      ).to.equal(120);

      // TODO > check for stat columns & other formulas
    });
    it("[updateTenderBidDataGrid][calculationField] no formula", async function() {
      const originalDataEntry = await TenderBidData.first(
        {
          tenderBidId: TENDER_BID_ID2,
          "volumeDescription.mapping": "11.001_to_12_ton"
        },
        { fields: { _id: 0, lineId: 1 } }
      );

      const args = {
        input: {
          tenderBidId: TENDER_BID_ID2,
          updates: [
            {
              newValue: {
                value: 120
              },
              lineId: originalDataEntry.lineId,
              colKey: "calculation.conversions.to_ton",
              cType: "calculationField"
            }
          ]
        }
      };
      await resolvers.Mutation.updateTenderBidDataGrid(null, args, context);

      const testDoc = await TenderBidData.first(
        { tenderBidId: TENDER_BID_ID2, lineId: originalDataEntry.lineId },
        { fields: { _id: 0 } }
      );

      // should: update both formula and value & register the calculation column
      expect(testDoc).to.not.equal(undefined);
      expect(get(testDoc, "calculation.conversions.to_ton.value")).to.equal(
        120
      );

      // TODO > check for stat columns & other formulas
    });
    it("[updateTenderBidDataGrid][calculationField] with formula", async function() {
      const originalDataEntry = await TenderBidData.first(
        {
          tenderBidId: TENDER_BID_ID2,
          "volumeDescription.mapping": "11.001_to_12_ton"
        },
        { fields: { _id: 0, lineId: 1 } }
      );

      const args = {
        input: {
          tenderBidId: TENDER_BID_ID2,
          updates: [
            {
              newValue: {
                value: 120,
                formula: "120*10"
              },
              lineId: originalDataEntry.lineId,
              colKey: "calculation.conversions.to_ton",
              cType: "calculationField"
            }
          ]
        }
      };
      await resolvers.Mutation.updateTenderBidDataGrid(null, args, context);

      const testDoc = await TenderBidData.first(
        { tenderBidId: TENDER_BID_ID2, lineId: originalDataEntry.lineId },
        { fields: { _id: 0 } }
      );

      // should: update both formula and value & register the calculation column
      expect(testDoc).to.not.equal(undefined);
      expect(get(testDoc, "calculation.conversions.to_ton.value")).to.equal(
        1200
      );
      expect(get(testDoc, "calculation.conversions.to_ton.formula")).to.equal(
        "120*10"
      );

      const testIfFormulaIsRegistered = get(
        testDoc,
        ["calculation", "formulaColumns"],
        []
      ).find(({ colKey }) => colKey === "calculation.conversions.to_ton");
      expect(testIfFormulaIsRegistered).to.not.equal(undefined);

      // TODO > check for stat columns & other formulas
    });
    it("[generateTenderBidDataGridFromPriceList]", async function() {
      const args = {
        input: {
          tenderBidId: TENDER_BID_ID,
          lineIds: [LINE_ID],
          priceListId: PRICE_LIST_ID
        }
      };
      const res = await resolvers.Mutation.generateTenderBidDataGridFromPriceList(
        null,
        args,
        context
      );
      expect(res).to.not.equal(undefined);
      expect(res.worker.isRunning).to.equal(true);
    });

    // this test seems to give random results sometimes ok sometimes nok
    // assertionError: the given combination of arguments (undefined and string) is invalid for this assertion. You can use an array, a map, an object, a set, a string, or a weakset instead of a string
    it.skip("[insertCalculationColumnTenderBidDataGrid] inserts calculation column", async function() {
      await TenderBidDataChanges._collection.remove({});
      const originalDataEntry = await TenderBidData.first(
        {
          tenderBidId: TENDER_BID_ID2,
          "volumeDescription.mapping": "11.001_to_12_ton"
        },
        { fields: { _id: 0, "main/freight.chargeValue": 1, lineId: 1 } }
      );
      debug("originalDataEntry %o", originalDataEntry);
      const args = {
        input: {
          tenderBidId: TENDER_BID_ID2,
          columnName: "Test Column",
          newColumnKey: "test_column",
          defaultValue: 1.05,
          operation: "multiply",
          refColumn: "main/freight",
          awaitResult: true
        }
      };
      const res = await resolvers.Mutation.insertCalculationColumnTenderBidDataGrid(
        null,
        args,
        context
      );
      debug("insertCalculationColumnTenderBidDataGrid res %o", res);
      expect(res).to.not.equal(undefined);

      const meta = await TenderBidDataMeta.first(
        {
          tenderBidId: TENDER_BID_ID2
        },
        { fields: { calculationHeaders: 1 } }
      );

      const addedItem = meta.calculationHeaders.slice(-1)?.[0];
      expect(addedItem).to.be.an("object");
      expect(addedItem.name).to.equal(args.input.newColumnKey);
      expect(addedItem.isManuallyAdded).to.equal(true);

      const countInsertedChanges = await TenderBidDataChanges.count(
        {
          tenderBidId: TENDER_BID_ID2
        },
        { fields: { _id: 0 } }
      );
      debug("countInsertedChanges %o", countInsertedChanges);
      expect(countInsertedChanges > 0).to.equal(true);

      const testDataEntry = await TenderBidData.first(
        {
          lineId: originalDataEntry.lineId,
          tenderBidId: TENDER_BID_ID2
        },
        { fields: { _id: 0, "main/freight.chargeValue": 1, calculation: 1 } }
      );

      expect(testDataEntry).to.not.equal(undefined);
      expect(testDataEntry["main/freight"]?.chargeValue).to.not.equal(
        undefined
      );
      expect(testDataEntry["main/freight"]?.chargeValue?.formula).to.contain(
        "[test_column]"
      );
      expect(testDataEntry["main/freight"]?.chargeValue?.mapping).to.equal(
        originalDataEntry["main/freight"]?.chargeValue?.mapping *
          args.input.defaultValue
      );

      // calculated column should be registered:
      const testIfFormulaIsRegistered = get(
        testDataEntry,
        ["calculation", "formulaColumns"],
        []
      ).find(({ colKey }) => colKey === "main/freight.chargeValue");
      expect(testIfFormulaIsRegistered).to.not.equal(undefined);
    });
  });

  describe("services", function() {
    describe("evaluateFormula", function() {
      it("evaluates a formula", function() {
        const formula =
          "=([base_rate_EUR] + [fuel_EUR] + [kmh_EUR] + [maut_EUR]) * [to_ton]";

        const refValues = {
          base_rate_EUR: 100,
          fuel_EUR: 1,
          kmh_EUR: 2,
          maut_EUR: 3,
          to_ton: 10
        };

        const { result, error } = evaluateFormula(formula, refValues);

        expect(result).to.equal(1060);
        expect(error).to.equal(undefined);
      });
      it("handles an incorrect formula", function() {
        const formula =
          "=([base_rate_EUR_INCORRECT] + [fuel_EUR] + [kmh_EUR] + [maut_EUR]) * [to_ton]";

        const refValues = {
          base_rate_EUR: 100,
          fuel_EUR: 1,
          kmh_EUR: 2,
          maut_EUR: 3,
          to_ton: 10
        };

        const { result, error } = evaluateFormula(formula, refValues);

        expect(error).to.equal(
          "ReferenceError: base_rate_EUR_INCORRECT is not defined"
        );
        expect(result).to.equal(undefined);
      });
    });
    describe("getCalculationRefValues", function() {
      it("gets the refValues for formula evaluation", function() {
        const calculationObject = {
          charges: [
            {
              label: "Base rate",
              leg: "main",
              name: "base_rate_EUR"
            },
            {
              label: "fuel",
              leg: "main",
              name: "fuel_EUR"
            },
            {
              label: "kmh",
              leg: "main",
              name: "kmh_EUR"
            },
            {
              label: "MAUT",
              leg: "main",
              name: "maut_EUR"
            }
          ],
          conversions: {
            to_ton: 0.06666666666666667
          },
          main: {
            base_rate_EUR: {
              rate: {
                costId: "o6fLThAWhaWW3uDaj",
                name: "Base rate",
                meta: {
                  source: "table"
                },
                amount: {
                  value: 1383,
                  unit: "EUR"
                },
                tooltip:
                  "1383 EUR per shipment | lane: EE01 | volume: 14875 - 15000 kg (@ 15000 kg)"
              },
              leg: "main",
              amount: {
                value: 1383,
                currency: "EUR"
              }
            },
            fuel_EUR: {
              rate: {
                costId: "rFRy3NwqyhaWwqJuJ",
                name: "fuel",
                amount: {
                  value: 12,
                  unit: "%"
                },
                tooltip: "12 % | volume: 14875 - 15000 kg (@ 15000 kg)"
              },
              leg: "main",
              amount: {
                value: 165.96,
                currency: "EUR"
              }
            },
            kmh_EUR: {
              rate: {
                costId: "d2FNtiSkP23MaLwiq",
                name: "kmh",
                amount: {
                  value: 2.72,
                  unit: "%"
                },
                tooltip: "2.72 % | volume: 14875 - 15000 kg (@ 15000 kg)"
              },
              leg: "main",
              amount: {
                value: 37.62,
                currency: "EUR"
              }
            },
            maut_EUR: {
              rate: {
                costId: "d2FNtiSkP23MaLwiq",
                name: "MAUT",
                amount: {
                  value: 1.82,
                  unit: "%"
                },
                tooltip: "1.82 % | volume: 14875 - 15000 kg (@ 15000 kg)"
              },
              leg: "main",
              amount: {
                value: 25.17,
                currency: "EUR"
              }
            }
          }
        };

        const refFactory = new GetCalculationRefValues(calculationObject);

        expect(refFactory.refValues).to.eql({
          to_ton: 0.06666666666666667,
          base_rate_EUR: 1383,
          fuel_EUR: 165.96,
          kmh_EUR: 37.62,
          maut_EUR: 25.17
        });
      });
    });
  });
});
