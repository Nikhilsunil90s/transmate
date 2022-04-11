import { createUserService } from "/imports/api/users/services/createUserSrv";
import { check } from "/imports/utils/check.js";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { User } from "/imports/api/users/User";
import fetch from "@adobe/node-fetch-retry";
import { AllAccountsSettings } from "/imports/api/allAccountsSettings/AllAccountsSettings";

const debug = require("debug")("exactOnline:cron");

const API_URL = `https://eu-de.functions.appdomain.cloud/api/v1/web/3baf9da3-9053-4895-9966-5a1b7b19031a/exactOnline/api`;

// 0. get sync Documents == []
// 1. set up user
// 2. set up account & roles
// 3. set up divisions
const setExactAccountApi = async ({ userId, accountId }) => {
  const path = "/SetAccount";
  const response = await fetch(API_URL + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accountId, userId })
  });
  return response.json();
};

export const processAction = async ({ toProcess, _id: userId }) => {
  debug("processAction action for userid %o", userId);

  // only process if there is a toProcess obj
  check(userId, String);
  check(toProcess, Object);
  const { user: userExact } = toProcess;
  if (!userExact) return null;
  const accountId = await createUserService({
    userId,
    user: {
      email: userExact.Email,
      firstName: userExact.FirstName,
      lastName: userExact.LastName
    },
    accountInput: {
      company: toProcess.divisions[0].CustomerName,
      type: "shipper"
    }
  }).getAccountId();
  check(accountId, String);

  // 2. set up divisions

  await AllAccounts._collection.update(
    { _id: accountId },
    {
      $set: {
        entities: (toProcess.divisions || []).map(div => ({
          code: div.Code,
          name: div.CustomerName,
          address: null,
          zipCode: null,
          city: null,
          country: div.Country.toLowerCase(),
          UID: null,
          registrationNumber: div.OBNumber,
          EORI: null,
          VAT: div.VATNumber,
          exactDivision: div.Code
        }))
      }
    }
  );

  // 4. store info, surpass schema
  await User._collection.rawCollection().updateOne(
    { _id: userId },
    {
      $set: {
        "toProcess.parsed": new Date()
      }
    }
  );

  // 5. set custom job
  await AllAccountsSettings.setCustomScript({
    accountId,
    script: {
      on: "shipment-stage.released",
      action: "script.exactOnline.price.confirmation"
    }
  });

  await setExactAccountApi({ userId, accountId });

  // call api with variables

  return { userId, accountId };
};

export const pendingUserActions = async (log = []) => {
  log.push("get pendingActions");

  // use ts key to avoid index on full obj
  // only take obj that have not been parsed
  const pendingUsers = await User.where({
    "toProcess.ts": { $exists: true },
    "toProcess.parsed": { $exists: false }
  });
  debug("pending actions %o", pendingUsers);
  log.push("pendingActions #", pendingUsers && pendingUsers.length);

  return pendingUsers;
};

export const processAccountActions = async (userObjects, log = []) => {
  log.push(`process user actions & confirm api : ${userObjects.length}`);
  return Promise.all(userObjects.map(processAction));
};

export const checkAndProcessUserActions = async (log = []) => {
  log.push("checkAndProcessUserActions start");
  const userObjects = await pendingUserActions(log);
  log.push("processAccountActions start");
  const results = await processAccountActions(userObjects, log);
  return { ok: true, results };
};
