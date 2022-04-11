import { AllAccounts } from "../../allAccounts/AllAccounts";
import { DEFAULT_VIEW } from "../enums/views";

const debug = require("debug")("partners:methods");

const DEFAULT_PARTNERSHIP_STATUS = "";

/** partner overview with stored queries */
export const partnerView = ({ accountId, userId }) => ({
  accountId,
  userId,
  fields: {
    id: "$_id",
    name: 1,
    type: 1
  },
  async get({ viewKey = DEFAULT_VIEW }) {
    let query;

    switch (viewKey) {
      case "activePartners":
        query = {
          $and: [
            { _id: { $ne: this.accountId } },
            {
              partners: {
                $elemMatch: {
                  accountId: this.accountId,
                  status: { $in: ["active"] }
                }
              }
            }
          ]
        };
        break;
      case "pendingPartners":
        query = {
          $and: [
            { _id: { $ne: this.accountId } },
            {
              partners: {
                $elemMatch: {
                  accountId: this.accountId,
                  status: { $in: ["pending"] }
                }
              }
            }
          ]
        };
        break;
      default:
        // all my partners:
        query = {
          $and: [
            { _id: { $ne: this.accountId } },
            {
              partners: {
                $elemMatch: {
                  accountId: this.accountId,
                  status: {
                    $nin: ["deleted", "rejected"]
                  }
                }
              }
            }
          ]
        };

        break;
    }

    const list = await AllAccounts._collection.aggregate([
      { $match: query },
      {
        $addFields: {
          annotation: {
            $arrayElemAt: [
              {
                $filter: {
                  input: { $ifNull: ["$accounts", []] },
                  as: "annotation",
                  cond: { $eq: ["$$annotation.accountId", this.accountId] }
                }
              },
              0
            ]
          }
        }
      },
      {
        $addFields: {
          partnersFiltered: {
            $arrayElemAt: [
              {
                $filter: {
                  input: { $ifNull: ["$partners", []] },
                  as: "partners",
                  cond: { $eq: ["$$partners.accountId", this.accountId] }
                }
              },
              0
            ]
          }
        }
      },

      {
        $addFields: {
          name: { $ifNull: ["$annotation.name", "$name"] },
          status: {
            $ifNull: ["$partnersFiltered.status", DEFAULT_PARTNERSHIP_STATUS]
          }
        }
      },
      {
        $project: {
          ...this.fields,
          status: 1
        }
      }
    ]);

    debug("partner overview %o", list);
    return list;
  }
});
