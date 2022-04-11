import { Meteor } from "meteor/meteor";

// collections
import { PriceList } from "/imports/api/pricelists/PriceList";

class PriceListServiceSRV {
  static setStats({ priceListId }) {
    if (Meteor.isServer) {
      const pipeline = [
        {
          $match: {
            _id: priceListId
          }
        },
        {
          $project: {
            laneCount: {
              $size: {
                $ifNull: ["$lanes", []]
              }
            },
            volumes: 1
          }
        },
        {
          $unwind: {
            path: "$volumes",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            rangeCount: {
              $size: {
                $ifNull: ["$volumes.ranges", []]
              }
            }
          }
        },
        {
          $group: {
            _id: {
              id: "$_id",
              laneCount: "$laneCount"
            },
            rangesCount: {
              $sum: "$rangeCount"
            }
          }
        },
        {
          $lookup: {
            from: "price.list.rate",
            localField: "_id.id",
            foreignField: "priceListId",
            as: "rates"
          }
        },
        {
          $unwind: {
            path: "$rates",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: {
              id: "$_id.id",
              laneCount: "$_id.laneCount"
            },
            rateCount: {
              $sum: 1
            }
          }
        },
        {
          $project: {
            _id: 0,
            laneCount: "$_id.laneCount",
            rangesCount: "$rangesCount",
            rateCount: "$rateCount"
          }
        }
      ];

      const summary = PriceList._collection.aggregate(pipeline, {
        allowDiskUse: true
      })[0];

      PriceList._collection.update({ _id: priceListId }, { $set: { summary } });
    }
  }
}

export { PriceListServiceSRV };
