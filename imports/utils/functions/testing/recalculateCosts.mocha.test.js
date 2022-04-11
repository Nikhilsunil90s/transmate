/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { simpleResult } from "/imports/api/pricelists/testing/priceLookupResult";
import {
  calculateTotalCost,
  ExchangeRate
} from "/imports/utils/functions/recalculateCosts.js";
import { Rate } from "/imports/api/rates/Rate.js";
import { rates, shipmentCosts } from "./recaluclateCostsTestData.js";

const debug = require("debug")("recalculate-costs:test");
const { expect } = require("chai");

describe("recalculate-costs", function() {
  beforeEach(async () => {
    await Rate._collection.remove({});
    debug("insert rates for dates in test obj");
    await Rate._collection.rawCollection().insertMany(rates);
  });
  it("check if 2 rates are in db", async function() {
    const result = await Rate.where({});
    expect(result).to.be.an("array");
    expect(result.length).to.equal(2);
  });
  it("recalculate costs from shipment", async function() {
    const result = await calculateTotalCost(shipmentCosts, "EUR");
    debug("recalculate result shipment", result);
    expect(result).to.be.an("object");
    expect(Math.round(result.amount)).to.equal(306);
    expect(result.currency).to.equal("USD");
  });

  it("recalculate costs from pricelookup", async function() {
    const result = await calculateTotalCost(simpleResult.costs[0].costs, "EUR");
    debug("recalculate result pricelookup", result);
    expect(result).to.be.an("object");
    expect(result.amount).to.equal(1100);
    expect(result.currency).to.equal("USD");
  });

  it("no rates in db (error)", async function() {
    await Rate._collection.remove({});
    try {
      await calculateTotalCost(simpleResult.costs[0].costs, "EUR");
    } catch (e) {
      expect(e.message).to.include("missing rate obj for");
    }
  });

  it("recalculate 1 rate", async function() {
    const exchangeRate = await new ExchangeRate().useLatestExchangeRate();
    const resultEur = await exchangeRate.convert(1000, "EUR", "EUR");
    expect(resultEur).to.equal(1000);
    const resultUsd = await exchangeRate.convert(1000, "USD", "USD");
    expect(resultUsd).to.equal(1000);
    const a = await exchangeRate.convert(1000, "EUR", "USD");
    const b = await exchangeRate.convert(1000, "USD", "EUR");
    expect(a).not.to.equal(1000);
    expect(b).not.to.equal(1000);
    expect(a * b).to.equal(1000000);
  });

  it("recalculate with class", async function() {
    const exchangeRate = await new ExchangeRate().useLatestExchangeRate();
    expect(exchangeRate.convert(1000, "EUR", "EUR")).to.equal(1000);
  });

  it("recalculate with class exact date", async function() {
    const exchangeRate = await new ExchangeRate().useExchangeDate("2020-05-20");
    expect(exchangeRate.convert(1000, "EUR", "EUR")).to.equal(1000);
  });
});
