import { Tender } from "../Tender";

export const pipelineBuilder = ({ accountId }) => ({
  accountId,
  pipeline: [],
  match({ query, tenderId, fields }) {
    this.pipeline = [
      ...this.pipeline,
      { $match: tenderId ? { _id: tenderId } : query },
      ...(fields ? [{ $project: fields }] : []),
      { $addFields: { id: "$_id" } }
    ];
    return this;
  },
  getAccounts() {
    this.pipeline = [
      ...this.pipeline,
      {
        $addFields: {
          isOwner: { $eq: ["$accountId", this.accountId] },
          isBidder: {
            $let: {
              vars: {
                bidderIdCheck: {
                  $map: {
                    input: { $ifNull: ["$bidders", []] },
                    in: { $eq: ["$$this.accountId", this.accountId] }
                  }
                }
              },
              in: { $anyElementTrue: "$$bidderIdCheck" }
            }
          }
        }
      },
      {
        // project according to access level:
        $addFields: {
          bidders: {
            $filter: {
              input: { $ifNull: ["$bidders", []] },
              cond: {
                $cond: [
                  "$isOwner",
                  true,
                  { $eq: ["$$this.accountId", this.accountId] }
                ]
              }
            }
          }
        }
      },
      {
        $addFields: {
          bidderIds: {
            $map: {
              input: { $ifNull: ["$bidders", []] },
              in: "$$this.accountId"
            }
          }
        }
      },
      {
        $lookup: {
          from: "price.list",
          let: { tenderId: "$_id", isOwner: "$isOwner", isBidder: "$isBidder" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    {
                      // owner condition:
                      $and: [
                        "$$isOwner",
                        { $eq: ["$tenderId", "$$tenderId"] },
                        { $in: ["$status", ["for-approval", "active"]] },
                        { $ne: ["$deleted", true] }
                      ]
                    },
                    {
                      // bidder condition
                      $and: [
                        "$$isBidder",
                        { $eq: ["$tenderId", "$$tenderId"] },
                        { $eq: ["$carrierId", this.accountId] },
                        {
                          $in: [
                            "$status",
                            ["draft", "reqeusted", "for-approval", "active"]
                          ]
                        },
                        { $ne: ["$deleted", true] }
                      ]
                    }
                  ]
                }
              }
            },
            {
              $project: {
                id: "$_id",
                title: 1,
                status: 1
              }
            }
          ],
          as: "priceLists"
        }
      }
    ];
    return this;
  },
  getDocuments() {
    this.pipeline = [
      ...this.pipeline,
      {
        $lookup: {
          from: "documents",
          let: { tenderId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$tenderId", "$$tenderId"] } } },
            { $addFields: { id: "$_id" } }
          ],
          as: "documents"
        }
      }
    ];
    return this;
  },
  aggregate() {
    return Tender._collection.aggregate(this.pipeline);
  }
});
