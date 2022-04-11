// if localhost = development , run functions locally
// if on server = production, run functions in cloud
import { Meteor } from "meteor/meteor";
import { check } from "/imports/utils/check.js";
import get from "lodash.get";

import mockedPriceLookup from "/imports/api/_jsonSchemas/fixtures/mock.priceLookup.json";
import mockedAddresses from "/imports/api/_jsonSchemas/fixtures/data.addresses.json";
import mockedLabelOptions from "/imports/api/_jsonSchemas/fixtures/mock.labelOptions.json";
import mockedConfirmLabelOption from "/imports/api/_jsonSchemas/fixtures/mock.confirmLabelOption.json";
import mockedCancelLabelOption from "/imports/api/_jsonSchemas/fixtures/mock.cancelLabelOption.json";
import mockedGenerateDoc from "/imports/api/_jsonSchemas/fixtures/mock.generateDoc.json";

const fetch = require("@adobe/node-fetch-retry");
const fs = require("fs");
const debug = require("debug")("cloudFunction:call-server");

// const path = require("path");

const functionList = [
  {
    types: ["exchangeRates"],
    url:
      "https://eu-de.functions.cloud.ibm.com/api/v1/web/TransmateOrg_live/getMissingExchangeRates/getMissingExchangeRates.json",
    localFunction: null
  },
  {
    types: ["sendGridWebhook"],
    path: "/sendGridWebhook",
    localFunction: "sendGridWebhook.js"
  },
  {
    types: ["confirmNumidiaRate"],
    path: "/numidiaSoap",
    localFunction: "numidiaSoap.js"
  },
  {
    types: ["seaDistances", "leadtime"],
    path: "/seaDistance",
    localFunction: "seaDistance.js"
  },
  {
    types: ["excelPriceList"],
    path: "/excelPriceList",
    localFunction: "excelPriceList.js"
  },
  {
    types: ["CreateShipmentInvoiceCost", "CheckCountryZip"],
    path: "/importApi",
    localFunction: "importsApi.js"
  },
  {
    types: ["test"],
    path: "/importApi",
    localFunction: "importsApi.js"
  },
  {
    types: ["CheckAddress"],
    path: "/importApi",
    localFunction: "importsApi.js",
    mock: { result: mockedAddresses[4] }
  },
  {
    types: ["Simulate", "simulate"],
    path: "/simulateRate",
    localFunction: "simulateRate.js"
  },
  {
    types: [
      "runStartAnalysisWorker",
      "runPriceLookup",
      "runPriceRequestSummary",
      "runPriceRequestBuildItems"
    ],
    path: "/rateCalculation",
    localFunction: "transmate-calculations.js",
    mock: mockedPriceLookup
  },
  {
    types: ["runShipPriceLookup"],
    path: "/rateCalculation",
    localFunction: "transmate-calculations.js",
    mock: mockedPriceLookup
  },
  {
    types: ["generateDoc"],
    path: "/template",
    localFunction: "template.js",
    mock: mockedGenerateDoc
  },
  {
    types: [
      "tenderifyMap",
      "tenderifyReadFile",
      "tenderifyUnifiedpricelist",
      "tenderifyWritePricelist"
    ],
    path: "/autoMapPricelists",
    localFunction: "autoMapPricelists.js"
  },
  {
    types: [
      "runStartTenderBidFillOutWorker",
      "runTenderBidFillOutWorker",
      "runTenderBidFillOutPostAction",
      "runTenderBidFillOutDirect"
    ],

    // path: "/tenderbidratecalc",
    url:
      "https://c99a35b8.eu-de.apigw.appdomain.cloud/transmateapi/tenderbidratecalc", // todo: currently hardcoded
    localFunction: null
  },
  {
    types: ["startWorkflow"],
    path: "/workflow",
    localFunction: null
  },

  // @jan -> to amend:
  {
    types: ["rates"],
    path: "/carrierConnect",
    localFunction: null,
    mock: mockedLabelOptions
  },
  {
    types: ["createlabel"],
    path: "/carrierConnect",
    localFunction: null,
    mock: mockedConfirmLabelOption
  },
  {
    types: ["cancelordeletelabel"],
    path: "/carrierConnect",
    localFunction: null,
    mock: mockedCancelLabelOption
  }
];

function fallback(action) {
  // eslint-disable-next-line no-eval
  eval(fs.readFileSync(action, "utf-8"));
  if (this.main) {
    // eslint-disable-next-line no-undef
    return main;
  }
  throw Error(`${action} has no function main or no exports.main`);
}

async function run(action, params) {
  if (!action) {
    throw Error("Missing argument <action-to-run>");
  }

  // support a non-exported main function as a fallback
  const mainfunct = fallback(action);
  try {
    const result = await mainfunct(params);
    return result;
  } catch (error) {
    console.error("issue with call fallback action");
    throw error;
  }
}

async function checkStatus(res) {
  if (res && res.ok) {
    // res.status >= 200 && res.status < 300
    return res;
  }
  if (res && res.body && res.body.error) {
    console.error("Error API Cloud call, error in body:", res.body.error);
    throw Error("issue with cloud api call, body contains error");
  }
  let message = `call to API gives wrong status Code :${res.status}`;
  try {
    const response = await res.json();

    console.error("detail of cloud api call error JSON", response);
    message = (response.error || {}).message || message;
  } catch (e) {
    console.error("detail of cloud api call error RAW", res, e);
  }

  throw Error(message);
}

/**
 * call the function on server
 * @param {{DB_URL: string, url: string, type: string, env:any, request:any}} param0
 * @param {string} type - The type of call.
 * @param {object} env - The user and account info,
 * @param {object} request - The request object
 * @return {object} returns object with result key {result}
 */
async function callCloudFunctionOnIbm({ DB_URL, url, type, env, request }) {
  // is server check, we can only use functions if we are on a remote db
  if (
    Meteor.isTest ||
    DB_URL.includes("localhost") ||
    DB_URL.includes("127.0.0.1")
  ) {
    debug(
      "we are mocking the %s cloud return with {result}!",

      type,
      process.env.CLOUD_RETURN_OBJ
    );
    return {
      result: process.env.CLOUD_RETURN_OBJ
        ? JSON.parse(process.env.CLOUD_RETURN_OBJ)
        : {}
    };
  }
  check(env.target, String); // process.env.REPORTING_TARGET sets the data in env
  check(process.env.IBM_FUNCTION_URL, String);
  check(process.env.IBM_FUNCTION_KEY, String);
  const headers = {
    "X-Require-Whisk-Auth": process.env.IBM_FUNCTION_KEY,
    apiKey: process.env.IBM_FUNCTION_KEY,
    "Content-Type": "application/json"
  };
  const body = {
    type,
    env,
    request,
    DB_URL
  };

  debug("request cloud url %s function %j to url %o", type, body, url);

  const fetchResult = await fetch(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers
  });
  await checkStatus(fetchResult);
  debug("request cloud url %s function %j ", type, body);
  const result = await fetchResult.json();
  return result;
}

/**
 * make decision what to call cloud/local
 *@param {string} DB_URL - The mongo uri
 * @param {string} type - The type of call.
 * @param {object} env - The user and account info,
 * @param {object} request - The request object
 */
export const callFunction = async ({ type, env, request, DB_URL }) => {
  if (!env || !env.accountId || !env.userId)
    throw Error(
      `missing env settings (accountId and userId), env:${JSON.stringify(
        env
      )}, on request type ${type}`
    );

  // set target (used for ie reports & numidia soap calls)
  env.target = process.env.REPORTING_TARGET;
  const functionParams = functionList.find(el => el.types.includes(type));
  if (!functionParams) throw Error(`missing serverless function type:${type}`);

  const isLocalRun = Meteor.settings.transmate_function_local;
  const isMockedResponse =
    process.env[`MOCK_${type}`] === "true" ||
    process.env[`MOCK_${type}`] === true;
  const isCloudCall = !isLocalRun && !isMockedResponse;

  if (isCloudCall) {
    // default to main ibm function url, default to empty path (if url is given.)
    const {
      url = process.env.IBM_FUNCTION_URL, // default to base url
      path = ""
    } = functionParams;
    const cloudResult = await callCloudFunctionOnIbm({
      DB_URL,
      url: url + path,
      type,
      env,
      request
    });
    const cloudError = get(cloudResult, "result.error.message");
    if (cloudError) throw Error(cloudError);
    return cloudResult;
  }

  if (isMockedResponse) {
    debug("return mocked result for %s", type);
    return functionParams.mock || null;
  }

  // local call
  const { localFunction } = functionParams;
  let response = null;
  try {
    debug("call function locally %o", {
      DB_URL,
      type,
      env,
      request,
      closeConnections: true
    });
    response = await run(
      Meteor.settings.transmate_function_local + localFunction,
      {
        DB_URL,
        type,
        env,
        request
      }
    );
  } catch (error) {
    debug("error in function call:", error);
    return null;
  }
  debug("lets return type %s response %o", type, response);
  return (response.body || {}).result || response;
};

exports.callFunction = callFunction;
