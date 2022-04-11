import { callFunction } from "./loadFunctions";

// const debug = require("debug")("cloudFunction");

export const callCloudFunction = async (type, request, env = {}) => {
  // debug("function run form server without login");
  env.accountId = env.accountId || "server";
  env.userId = env.userId || "server";

  const DB_URL = process.env.MONGO_URL;
  return callFunction({ env, type, request, DB_URL });
};
