import { callCloudFunction as orgFn } from "/imports/utils/server/ibmFunctions/callFunction.js";

const debug = require("debug")("mock:ibm");

export const callCloudFunction = async (type, request, env) => {
  debug("mock ibm call", { type, request, env });

  if (process.env[`MOCK_${type}`] === "true" || process.env[`MOCK_${type}`] === true) {
    debug("mock ibm call with real function");
    return orgFn(type, request, env);
  }
  return {};
};
