import { check, Match } from "/imports/utils/check.js";

import fetch from "@adobe/node-fetch-retry";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";

const debug = require("debug")("exact:sync-partner");

const API_URL = `https://eu-de.functions.appdomain.cloud/api/v1/web/3baf9da3-9053-4895-9966-5a1b7b19031a/exactOnline/api`;

// will sync partner on carrierId code, does not update if ediId is set
export const syncExactPartner = async ({
  division,
  carrierId,
  name,
  accountId
}) => {
  debug("syncExactPartner start %s %s", carrierId, name);

  // eslint-disable-next-line new-cap
  check(division, Match.OneOf(String, Number));
  check(carrierId, String);
  check(accountId, String);
  const partnerItem = {
    Code: carrierId || "transporter",
    Description: name || "transport costs",
    update: "1",
    IsSalesItem: true,
    IsStockItem: false,
    IsPurchaseItem: true
  };
  const path = "/SyncItem";
  const response = await fetch(API_URL + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ division, item: partnerItem })
  });
  const { status, ok, statusText } = response;
  if (!ok) throw Error(`SyncItem not successfull:${status},${statusText}`);
  const result = await response.json();
  debug("set item result", result);
  if (result && result.result) {
    await AllAccounts._collection.update(
      {
        _id: carrierId,
        accounts: { $elemMatch: { accountId } }
      },
      { $set: { "accounts.$.coding.ediId": result.result } },
      { bypassCollection2: true }
    );
  }

  // update ediId carrier returns ID
  return (result || {}).result;
};
