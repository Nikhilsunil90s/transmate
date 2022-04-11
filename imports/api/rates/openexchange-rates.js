import { check } from "/imports/utils/check.js";

import fetch from "@adobe/node-fetch-retry";

const debug = require("debug")("rate:getExchangeRates");

export const getRateForDate = date => {
  const regex = RegExp(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/);
  if (!regex.test(date)) throw Error("date must be in format YYYY-MM-DD");
  if (typeof process.env.OPEN_EXCHANGE_RATES_API !== "string")
    throw Error("we are missing env OPEN_EXCHANGE_RATES_API!");
  return new Promise((resolve, reject) => {
    debug("get rate from openexchange, missing rate! %o", date);
    const key = process.env.OPEN_EXCHANGE_RATES_API;
    const url = `https://openexchangerates.org/api/historical/${date}.json?app_id=${key}`;
    debug("call api with %s", url);
    fetch(url)
      .then(res => res.json())
      .then(result => {
        debug("openexchange success");
        check(result, Object);
        delete result.disclaimer;
        delete result.license;
        resolve({ date, ...result });
      })
      .catch(error => {
        debug(`Error:No rate returned!`, error);
        reject(error);
      });
  });
};
