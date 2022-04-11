import moment from "moment";
import { addCron } from "./cron";
import { PriceList } from "/imports/api/pricelists/PriceList";

const debug = require("debug")("synced-cron:archive old spot pricelists");

addCron({
  name: "Archive old SpotPriceLists",
  cron: "1 3 * * *",
  job(cronLog = []) {
    const dateTreshHold = moment()
      .subtract(2, "months")
      .toDate();

    try {
      // get price lists:
      const priceListIds = PriceList._collection
        .aggregate([
          {
            $match: {
              type: "spot",
              status: { $in: ["active", "assigned", "for-approval"] }
            }
          },
          {
            $unwind: { path: "$shipments", preserveNullAndEmptyArrays: true }
          },
          {
            $lookup: {
              from: "shipments",
              let: { shipmentId: "$shipments.shipmentId" },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$shipmentId"] } } },
                { $project: { status: 1 } }
              ],
              as: "shipmentInfo"
            }
          },
          {
            $unwind: { path: "$shipmentInfo", preserveNullAndEmptyArrays: true }
          },
          {
            $group: {
              _id: { id: "$_id", createdAt: "$created.at" },
              shipmentItems: { $push: "$shipmentInfo.status" }
            }
          },
          {
            $addFields: {
              allShipmentsAllocated: {
                $allElementsTrue: {
                  $map: {
                    input: "$shipmentItems",
                    in: { $in: ["$$this", ["completed", "canceled"]] }
                  }
                }
              }
            }
          },
          {
            $match: {
              $or: [
                { allShipmentsAllocated: true },
                {
                  "_id.createdAt": {
                    $lt: dateTreshHold
                  }
                }
              ]
            }
          },
          { $project: { _id: "$_id.id" } }
        ])
        .map(({ _id }) => _id);

      // update:
      if (priceListIds.length > 0) {
        PriceList._collection.update(
          { _id: { $in: priceListIds } },
          { $set: { status: "archived" } },
          { multi: true }
        );
      }

      cronLog.push(`archived ${priceListIds.length} spot priceLists`);
      debug("log", cronLog);

      return { result: "done.." };
    } catch (error) {
      return { error: error.message };
    }
  }
});
