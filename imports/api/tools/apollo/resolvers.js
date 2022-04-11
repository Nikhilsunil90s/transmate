import fetch from "@adobe/node-fetch-retry";
import querystring from "querystring";
import SecurityChecks from "/imports/utils/security/_security";
import moment from "moment";
import get from "lodash.get";
import { JobManager } from "../../../utils/server/job-manager.js";

import { Address } from "/imports/api/addresses/Address";
import { callCloudFunction } from "/imports/utils/server/ibmFunctions/callFunction";

const debug = require("debug")("resolvers:tools");

const API_URL = "https://4e1dcbfc.eu-de.apiconnect.appdomain.cloud/SeaDistance";

async function getLocationData(loc) {
  if (loc.type === "address") {
    const address = await Address.first(loc.id);
    return {
      countryCode: address.countryCode,
      zipCode: address.zip,
      latLng: address.latLng,
      addressId: address._id
    };
  }
  return {
    countryCode: loc.id.substr(0, 2),
    locationId: loc.id
  };
}

export const resolvers = {
  Mutation: {
    async getRouteInsights(root, args, context) {
      const { userId, accountId } = context;
      const { from, to, goods, equipment } = args.input;

      SecurityChecks.checkLoggedIn(userId);
      debug("params :o", args.input);

      const [fromData, toData] = await Promise.all([
        getLocationData(from),
        getLocationData(to)
      ]);

      const query = {
        accountId,
        date: moment().format("YYYY-MM-DD"),
        from: fromData,
        to: toData,
        ...(goods && goods.amount
          ? { goods: { [goods.code]: goods.amount } }
          : {}),
        ...(equipment
          ? {
              equipments: [{ type: equipment.code, quantity: equipment.amount }]
            }
          : {})
      };

      JobManager.post("tools.route-insight", {
        userId,
        accountId,
        data: query
      });

      const res = await callCloudFunction(
        "Simulate",
        { ...query, top: true },
        context
      );

      return {
        air: get(res, ["result", "air", "results"]),
        road: get(res, ["result", "road", "results"]),
        sea: get(res, ["result", "sea", "results"])
      };
    },
    async getOceanDistance(root, args, context) {
      const { userId, accountId } = context;
      const { from, to } = args.input;

      debug("ocean params :o", args.input);

      SecurityChecks.checkLoggedIn(userId);

      JobManager.post("tools.ocean-distance", {
        userId,
        accountId,
        data: { from, to }
      });

      const response = await fetch(
        `${API_URL}?${querystring.stringify({ from, to })}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        }
      );

      const results = await response.json();

      return results || {};
    }
  }
};
