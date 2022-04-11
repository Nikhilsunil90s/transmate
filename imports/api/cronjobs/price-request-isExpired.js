import moment from "moment";
import { JobManager } from "../../utils/server/job-manager.js";

import { PriceRequest } from "../priceRequest/PriceRequest";
import { addCron } from "./cron";

const debug = require("debug")("synced-cron:pr:notify users on expired prs");

/**
 * cron job that:
 *
 *  "requested" and date > dueDate
 * creates "expiring" notification for the owner
 */

addCron({
  name: "Update expired priceRequests",
  logging: true,

  // schedule: "1 hour", // don't use 60 minutes , minutes only <60
  interval: 60 * 60,
  async job(cronLog = []) {
    try {
      debug("run expired prs");
      const priceRequests = [];
      const threshold = moment()
        .subtract(1, "hour")
        .toDate();

      // create "expired" notification for price request
      // run every 60 min, and get the ones that have been expired in the last 60 min
      // dueDate < now and >now-1H
      await PriceRequest._collection
        .find(
          {
            status: "requested",
            dueDate: { $gte: threshold, $lt: new Date() },
            deleted: { $ne: true }
          },
          { _id: 1, title: 1 }
        )
        .forEach(priceRequest => {
          debug("expired pr:%o", priceRequest._id);
          priceRequests.push(priceRequest._id);
          cronLog.push(`send notification for ${priceRequest._id}`);
          JobManager.post("price-request.expired", {
            priceRequestId: priceRequest._id
          });
        });
      debug("log", cronLog);
      return { result: `prs:${priceRequests.join(",")}` };
    } catch (error) {
      return { error: error.message };
    }
  }
});
