/* eslint-disable no-await-in-loop */
import moment from "moment";
import { JobManager } from "../../utils/server/job-manager.js";
import { WorkerNotifications } from "/imports/api/workerNotifications/WorkerNotifications";
import { PriceRequest } from "/imports/api/priceRequest/PriceRequest";
import { priceRequestService } from "/imports/api/priceRequest/services/priceRequest";
import { addCron } from "./cron";

const debug = require("debug")("synced-cron:process api notifications");

debug("monitor worker notifications!");

addCron({
  name: "Convert api notifications to meteor",

  // schedule: "1 minute",
  interval: 60,
  async job(cronLog = []) {
    try {
      const threshold = moment()
        .subtract(1, "minute")
        .toDate();
      debug("check notifications in api collection, before %o", threshold);

      const workerNotifications = await WorkerNotifications._collection.aggregate(
        [
          {
            $match: {
              readDT: {
                $exists: false
              }
            }
          },
          {
            $group: {
              _id: {
                accountId: "$data.accountId",
                type: "$type",
                event: "$event"
              },
              count: {
                $sum: 1
              },
              lastUpdate: {
                $last: "$createdDT.at"
              },
              ids: {
                $push: "$_id"
              },
              dataIds: {
                $addToSet: "$data._id"
              }
            }
          }
        ],
        {
          allowDiskUse: false
        }
      );

      /* returns this type of obj
     { 
    "_id" : {
        "accountId" : "S46614", 
        "type" : "shipment", 
        "event" : "canceled"
    }, 
    "count" : 2.0, 
    "lastUpdate" : ISODate("2020-04-29T12:18:15.762+0000"), 
    "ids" : [
        ObjectId("5ea176f2512944000758739b"), 
        ObjectId("5ea970874ab6700007c18100")
    ], 
    "dataIds" : [
        "JBGhvt7TpXEzaFaet", 
        "YvifgTcFqN5Dqe7Tn"
    ]
}
      */
      cronLog.push(
        `notifications lines to process ${workerNotifications.length}`
      );
      debug("notifications lines to process %o", workerNotifications.length);

      // shipment created
      // eslint-disable-next-line no-restricted-syntax
      for await (const line of workerNotifications) {
        const { accountId, type, event } = line._id || {}; // group id
        debug("process %o", { accountId, type, event });
        if (line.lastUpdate < threshold) {
          // updates more than 1 minute old,
          // send out a bluk update
          debug("create notifications", {
            accountId,
            numberOfShipments: line.count
          });
          JobManager.post(`worker.${type}.${event}`, {
            accountId,
            numberOfShipments: line.count
          });
          if (
            type === "shipment" &&
            event === "canceled" &&
            Array.isArray(line.dataIds)
          ) {
            cronLog.push(`process shipment canceled : ${line.count}`);
            debug("process %o shipment canceled", line.count);
            const priceRequests = PriceRequest.where({
              "items.shipmentId": { $in: line.dataIds }
            });
            const updated = {
              by: `automated-${accountId}`,
              at: new Date()
            };
            // eslint-disable-next-line no-restricted-syntax
            for await (const priceReq of priceRequests) {
              if (priceReq.items.length === 1) {
                // only 1 item so it is a 1/1 relation, let's delete the pr
                const srv = priceRequestService({});
                await srv.init({ priceRequest: priceReq });
                await srv.update_async({ status: "deleted", updated });
                srv.allowShipmentAccess(false);
                cronLog.push(`send cancelation from priceRequest: ${priceReq}`);

                // send cancellation to bidders
                JobManager.post("price-request.cancelled", {
                  priceRequest: priceReq
                });
              } else {
                // what if multiple shipments are linked to one price request?
                // to do : update price request (recalculate totals!)
                cronLog.push(`send modified priceRequest: ${priceReq}`);

                // to do  : check this flow (modified in draft-> no email, else cancel bids, resend email)
                JobManager.post("price-request.modified", {
                  priceRequestId: priceReq._id
                });
              }
            }
          }
          debug("set notification api on read %o", line.ids);

          // we use mongoids for this collection, lets do a rawCollection Update to avoid issues
          await WorkerNotifications._collection
            .rawCollection()
            .update(
              { _id: { $in: line.ids } },
              { $set: { readDT: new Date() } },
              { multi: true }
            );
        } else {
          // data is still comming in so lets hold off for 1 min
          cronLog.push(
            `data still comming in for  account : ${accountId}, so we wait...`
          );
          debug("still processing data for :%o", { accountId, type, event });
        }
      }
      return { result: "done.." };
    } catch (error) {
      return { error: error.message };
    }
  }
});
