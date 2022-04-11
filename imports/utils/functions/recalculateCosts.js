import moment from "moment";
import { Rate } from "/imports/api/rates/Rate.js";
import fx from "money";
import { check } from "/imports/utils/check.js";

const debug = require("debug")("recalculate:costs");

function convert(rateObj, amount, fromCurrency, targetCurrency) {
  // debug("rateobj %o", rateObj);
  debug("convert", { amount, fromCurrency, targetCurrency });
  check(amount, Number);
  check(fromCurrency, String);
  check(targetCurrency, String);
  check(rateObj?.base, String);
  if (fromCurrency === targetCurrency) {
    return amount;
  }
  fx.base = rateObj.base;
  fx.rates = rateObj.rates;
  return fx.convert(amount, {
    from: fromCurrency,
    to: targetCurrency
  });
}

function convertCurrencyDate(dateObj) {
  if (typeof dateObj === "string" && dateObj.length === 10) return dateObj;
  let date = moment(dateObj).format("YYYY-MM-DD");
  const today = moment().format("YYYY-MM-DD");
  const yesterday = moment()
    .subtract(1, "day")
    .format("YYYY-MM-DD");

  // you can not get historic rates of today or future, so lets fix this call to rates of yesterday!
  if (date === today || dateObj > new Date()) {
    debug(
      "get rate from yesterday , because request is for today or future",
      date
    );

    // return currency of yesterday!
    // eslint-disable-next-line no-param-reassign
    date = yesterday;
  }
  return date;
}

export const convertCosts = costs => {
  if (costs && !Array.isArray(costs)) {
    console.error(costs, "is not an array");
    throw Error("input to convertCosts should be array");
  }

  // convert to cost obj for function
  const resultCosts = (costs || []).map(cost => {
    if (cost && cost.amount) {
      // shipment cost
      return {
        ...cost
      };
    }
    if (cost && cost.total) {
      // pricelookup
      return {
        ...cost,
        date: new Date(),
        amount: {
          value: cost.total.listValue,
          currency: cost.total.listCurrency
        }
      };
    }
    return undefined;
  });
  return resultCosts;
};

export const latestExchangeRates = async () => {
  return Rate.first(
    {},
    {
      sort: {
        date: -1.0
      }
    }
  );
};

// function to calculate total in carrier currency
// costs can come from shipment (selected cost) or from pricelookup
// obj = {date, amount:{currency, value}}

export const calculateTotalCost = async (costs, compareCurrency = "EUR") => {
  // get rates for dates in costs (at once)
  const costsToConvert = convertCosts(costs);
  const dates = costsToConvert.map(cost => convertCurrencyDate(cost.date));

  const rates = await Rate.where({ date: { $in: dates } });
  debug("conversion rates for dates:%o, rates %o", dates, typeof rates);

  // all costs to EUR to be able to sort
  let recalculatedCosts = costsToConvert.map(cost => {
    const rateObj = rates.find(
      rate => rate.date === convertCurrencyDate(cost.date)
    );
    if (!rateObj) {
      cost.error = `missing rate obj for ${convertCurrencyDate(cost.date)}`;
      return cost;
    }
    const convertedQty = convert(
      rateObj,
      cost.amount.value,
      cost.amount.currency,
      compareCurrency
    );
    debug("converted qty returned :", convertedQty);
    cost.recalculatedCost = convertedQty || cost.amount.value; // if conversion did not work
    return cost;
  });

  // return error if we dont have a rate obj
  if (recalculatedCosts.some(el => el.error))
    throw Error(recalculatedCosts.find(el => el.error).error);

  // sort big to small
  recalculatedCosts.sort((a, b) => {
    return b.recalculatedCost - a.recalculatedCost;
  });

  // default currency, biggest item
  const targetCurrency = recalculatedCosts[0].amount.currency;

  // recalculate and sum
  let amount = 0;
  let compareAmount = 0;
  recalculatedCosts = costsToConvert.map(cost => {
    const rateObj = rates.find(
      rate => rate.date === convertCurrencyDate(cost.date)
    );
    const convertedQty = convert(
      rateObj,
      cost.amount.value,
      cost.amount.currency,
      targetCurrency
    );
    debug("converted qty returned :", convertedQty);
    cost.targetCurrency = targetCurrency;

    cost.targetAmount = convertedQty || cost.amount.value;
    amount += cost.targetAmount;
    compareAmount += cost.recalculatedCost;
    return cost;
  });
  debug("results: %o", {
    amount,
    currency: targetCurrency,
    compareCurrency,
    compareAmount,
    recalculatedCosts
  });
  return {
    amount,
    currency: targetCurrency,
    compareAmount,
    compareCurrency,
    recalculatedCosts
  };
};

export class ExchangeRate {
  async useLatestExchangeRate() {
    this.rateObj = await latestExchangeRates();
    return this;
  }

  async useExchangeDate(inputDate) {
    const date = convertCurrencyDate(inputDate);

    // db.getCollection('rates').find({date:{$lte:"2018-03-22"}}).sort({date:-1}).limit(1)
    this.rateObj = await Rate.first(
      { date: { $lte: date } },
      { sort: { date: -1 } }
    );
    if (!this.rateObj) {
      throw Error(`missing rate obj for ${date}`);
    }
    debug(
      "we found this date %o for this requested date %o",
      this.rateObj.date,
      inputDate
    );
    return this;
  }

  convert(amount, fromCurrency, targetCurrency) {
    debug("recalculate %o", { amount, fromCurrency, targetCurrency });
    return convert(this.rateObj, amount, fromCurrency, targetCurrency);
  }
}
