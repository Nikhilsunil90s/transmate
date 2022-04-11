import { PriceRequest } from "../PriceRequest";

export const getPriceRequestForDownload = ({ accountId, userId }) => ({
  accountId,
  userId,
  async get({ query = {} }) {
    const { from, to, bidStatus = [], role = "bidder" } = query;
    const includeWon = bidStatus.includes("won");
    const includeLost = bidStatus.includes("lost");
    const includeNoBid = bidStatus.includes("no bid");

    const pipelineBidder = [
      {
        $match: {
          "bidders.accountId": this.accountId,
          deleted: false,
          status: { $nin: ["deleted"] },
          "created.at": { $gte: new Date(from), $lt: new Date(to) }
        }
      },
      {
        $addFields: {
          bidders: {
            $filter: {
              input: "$bidders",
              cond: { $eq: ["$$this.accountId", this.accountId] }
            }
          }
        }
      },
      { $unwind: "$bidders" },
      { $unwind: "$items" }, // holds the bid items
      {
        $lookup: {
          from: "shipments",
          let: { shipmentId: "$items.shipmentId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$shipmentId"] } } },
            { $project: { pickup: 1, delivery: 1, references: 1, number: 1 } }
          ],
          as: "shipment"
        }
      },
      { $unwind: "$shipment" },
      {
        $addFields: {
          offer: {
            $arrayElemAt: [
              {
                $filter: {
                  input: { $ifNull: ["$bidders.simpleBids", []] },
                  as: "myBids",
                  cond: { $eq: ["$items.shipmentId", "$$myBids.shipmentId"] }
                }
              },
              0
            ]
          }
        }
      },
      {
        $project: {
          _id: 0,
          requestId: "$_id",
          requestTitle: "$title",
          requestStatus: "$status",
          requestDueDate: "$dueDate",
          requestVersion: "$version",
          requestCustomerId: "$customerId",

          requestParticipated: "$bidders.bid",

          // #shipment:
          shipmentId: "$shipment._id",
          shipmentNumber: "$shipment.number",
          shipmentPickup: "$shipment.pickup",
          shipmentDelivery: "$shipment.delivery",

          offerDate: "$offer.date",
          offerWon: "$offer.won",
          offerLost: "$offer.lost",
          offerChargeLines: "$offer.chargeLines"
        }
      },
      {
        $match: {
          $or: [
            ...(includeWon ? [{ offerWon: { $ne: null } }] : []),
            ...(includeLost ? [{ offerLost: { $ne: null } }] : []),
            ...(includeNoBid
              ? [
                  {
                    $and: [
                      { offerWon: { $eq: null } },
                      { offerlost: { $eq: null } }
                    ]
                  }
                ]
              : [])
          ]
        }
      },
      {
        $unwind: {
          path: "$offerChargeLines",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          "offerChargeLines.chargeId": 0,
          "offerChargeLines.costId": 0
        }
      }
    ];

    // currently not used:
    const pipelineBuyer = [
      {
        $match: {
          accountId: this.accountId,
          deleted: false,
          status: { $nin: ["deleted"] },
          "created.at": { $gte: new Date(from), $lt: new Date(to) }
        }
      },
      { $unwind: "$items" }, // holds the bid items
      {
        $lookup: {
          from: "shipments",
          let: { shipmentId: "$items.shipmentId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$shipmentId"] } } },
            { $project: { pickup: 1, delivery: 1, references: 1, number: 1 } }
          ],
          as: "shipment"
        }
      },
      { $unwind: "$shipment" },
      {
        $addFields: {
          offerCount: {
            $size: {
              $filter: {
                input: { $ifNull: ["$bidders", []] },
                as: "bidder",
                cond: {
                  $in: [
                    "$items.shipmentId",
                    {
                      $map: {
                        input: { $ifNull: ["$$bidder.simpleBids", []] },
                        as: "bid",
                        in: "$$bid.shipmentId"
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      },
      {
        $project: {
          requestId: "$_id",
          requestTitle: "$title",
          requestStatus: "$status",
          requestDueDate: "$dueDate",
          requestVersion: "$version",
          requestCustomerId: "$customerId",

          requestParticipated: "$bidders.bid",

          // #shipment:
          shipmentId: "$shipment._id",
          shipmentNumber: "$shipment.number",
          shipmentPickup: "$shipment.pickup",
          shipmentDelivery: "$shipment.delivery",

          offerCount: "1",
          bidderCount: { size: "$bidders" }
        }
      }
    ];

    const pipeline = role === "bidder" ? pipelineBidder : pipelineBuyer;

    const res = PriceRequest._collection.aggregate(pipeline);

    return res;
  }
});
