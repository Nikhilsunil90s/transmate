import { PriceRequest } from "../PriceRequest";
import { priceRequestHelpers } from "./priceRequestHelpers";
import { CheckPriceRequestSecurity } from "/imports/utils/security/checkUserPermissionsForRequest";

const debug = require("debug")("price-request:get");

export const getPriceRequest = ({ accountId, userId, roles }) => ({
  accountId,
  userId,
  fields: {
    id: "$_id",
    customerId: 1,
    creatorId: 1,
    requestedBy: 1,
    type: 1,
    status: 1,
    currency: 1,
    dueDate: 1,
    items: 1,
    notes: 1,
    bidders: 1,
    settings: 1,
    requirements: 1,
    version: 1,
    title: 1,
    calculation: 1,
    analyseData: 1
  },
  checkStatusIds({ priceRequestIds }) {
    if (!Array.isArray(priceRequestIds) || priceRequestIds.length === 0)
      return [];
    return PriceRequest.find(
      {
        _id: { $in: priceRequestIds },
        ...priceRequestHelpers.viewActivePriceRequests({
          accountId: this.accountId
        })
      },
      { fields: { _id: 1, status: 1 } }
    ).fetch();
  },
  async get({ priceRequestId }) {
    // owner gets full access, bidder only sees limited data
    // owner should also see calcuation
    const pipeline = [
      {
        $match: {
          _id: priceRequestId,
          ...priceRequestHelpers.viewActivePriceRequests({
            accountId: this.accountId
          })
        }
      },
      { $project: this.fields },
      {
        $lookup: {
          from: "accounts",
          let: { customerId: "$customerId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$$customerId", "$_id"] } } },
            { $project: { id: "$_id", name: 1 } }
          ],
          as: "customerTemp"
        }
      },
      { $addFields: { customer: { $arrayElemAt: ["$customerTemp", 0] } } },
      { $addFields: { customerName: "$customer.name" } },
      {
        $lookup: {
          from: "users",
          let: { userId: "$requestedBy" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
            { $project: { profile: 1 } }
          ],
          as: "userTemp"
        }
      },
      { $addFields: { user: { $arrayElemAt: ["$userTemp", 0] } } },
      { $project: { userTemp: 0, customerTemp: 0 } }
    ];

    const requests = await PriceRequest._collection.aggregate(pipeline);

    let priceRequestObj = requests && requests[0];
    if (!priceRequestObj) return null;
    const checkCanSeeTokens = new CheckPriceRequestSecurity(
      { request: priceRequestObj },
      { accountId: this.accountId, userId: this.userId }
    )
      .setUserRoles(roles)
      .can({ action: "seeTokenLink" })
      .check();
    debug("add tokens link %o", checkCanSeeTokens);
    if (checkCanSeeTokens) {
      priceRequestObj = await priceRequestHelpers.addTokens(priceRequestObj);
    }

    // set data correctly for bidder and owner
    return priceRequestHelpers.enrich(priceRequestObj, this.accountId);
  },
  async getInsights({ priceRequestId }) {
    const priceRequest = await PriceRequest.first(priceRequestId, {
      fields: { analyseData: 1, calculation: 1 }
    });

    if (!priceRequest.accountId === this.accountId)
      return { id: priceRequestId }; // hide if not the owner
    return priceRequest;
  }
});
