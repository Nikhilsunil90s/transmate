import { PriceRequest } from "../PriceRequest";
import { priceRequestHelpers } from "/imports/api/priceRequest/services/priceRequestHelpers";
import { DEFAULT_VIEW } from "../enums/views";

const debug = require("debug")("pricerequest:view");

export const priceRequestView = ({ userId, accountId }) => ({
  userId,
  accountId,
  fields: {
    id: "$_id",
    customerId: 1,
    customer: 1,
    status: 1,
    type: 1,
    title: 1,
    dueDate: 1,
    accountId: 1,
    numberOfItems: 1,
    bidders: 1,
    "created.at": 1,
    requestedBy: 1,
    "user.profile": 1,
    "user.emails": 1
  },
  async get({ viewKey = DEFAULT_VIEW, filters }) {
    debug("build price request overview!", { viewKey, filters });

    // set default view, authorised to view, filters under $or key, so should not overwritten by filters/below!

    let query = priceRequestHelpers.viewActivePriceRequests({
      accountId: this.accountId
    });

    switch (viewKey) {
      case "draftRequests":
        query = { ...query, status: "draft" };
        break;
      case "allRequests":
        query = {
          ...query,
          status: { $nin: ["deleted"] }
        };
        break;
      case "allByMe":
        query = {
          ...query,
          requestedBy: this.userId,
          status: { $nin: ["deleted"] }
        };
        break;
      case "activeByMe":
        query = {
          ...query,
          requestedBy: this.userId,
          status: { $in: ["requested", "draft"] }
        };
        break;

      default:
        // active price requests
        query = {
          ...query,
          status: { $in: ["requested", "draft"] }
        };
        break;
    }

    // add filters (based on search field)
    // filters can be overwritten by query settings to avoid security issues
    query = { ...filters, ...query };

    // remove _collection to start using the buffer method,
    // for this buffer to work we need to remove the dueDate timestamp (round to day)

    const result = await PriceRequest._collection.aggregate([
      {
        $match: query
      },
      {
        $addFields: { numberOfItems: { $size: { $ifNull: ["$items", []] } } }
      },
      { $sort: { "created.at": -1 } },
      {
        $lookup: {
          from: "accounts",
          let: { customerId: "$customerId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$customerId"] } } },
            { $project: { _id: 0, name: 1 } }
          ],
          as: "customerInfo"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "requestedBy",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      {
        $addFields: {
          user: {
            $arrayElemAt: ["$userInfo", 0]
          }
        }
      },
      { $addFields: { customer: { $arrayElemAt: ["$customerInfo", 0] } } },
      { $project: this.fields }
    ]);
    debug("got results %o", result.length);

    return result.map(priceRequest => {
      return priceRequestHelpers.enrich(priceRequest, accountId);
    });
  }
});
