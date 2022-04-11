import { check, Match } from "/imports/utils/check.js";

import fetch from "@adobe/node-fetch-retry";

const debug = require("debug")("exact:sync-cost");

const API_URL = `https://eu-de.functions.appdomain.cloud/api/v1/web/3baf9da3-9053-4895-9966-5a1b7b19031a/exactOnline/api`;

export const syncExactCost = async ({
  division,
  deliveryNumber,
  ediId, // partner
  totalCostEur,
  trackingNumber
}) => {
  debug("syncExactCost start");
  check(ediId, String);
  // eslint-disable-next-line new-cap
  check(division, Match.OneOf(String, Number, undefined));
  check(deliveryNumber, Number);
  check(totalCostEur, Number);

  // convert  referenceNumber to DeliveryNumber
  const DeliveryNumber = deliveryNumber;
  // eslint-disable-next-line no-param-reassign

  const cost = {
    ItemId: ediId,
    totalCostEur,
    quantity: 1,
    reference: trackingNumber
  };
  debug("set cost %o", cost);
  const path = "/SyncTransportCost";
  const response = await fetch(API_URL + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ division, DeliveryNumber, cost })
  });
  return response.json();
};
