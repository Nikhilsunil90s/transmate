/* eslint-disable no-await-in-loop */

import { Promise as MeteorPromise } from "meteor/promise";
import { PriceRequest } from "../priceRequest/PriceRequest";
import { addCron } from "./cron";
import { PriceRequestUpdateMail } from "/imports/api/priceRequest/email/price-request-overview.js";

const debug = require("debug")("synced-cron:pr:notify carriers on updates");

export const findPriceRequestsToProcessMails = async (log = []) => {
  try {
    // const lastWeek = new Date(ts - 7 * 24 * 3600 * 1000);

    // gets all flagged prs
    const prs = await PriceRequest._collection.rawCollection().find(
      {
        deleted: false,

        //    "bidders.simpleBids.won": { $gte: lastWeek },
        "bidders.simpleBids.queueMail": { $exists: true }
      },
      { fields: { _id: 1 } }
    );

    log.push(`prs to process :${await prs.count()}`);
    debug("prs cronlog", log);
    const results = [];

    // way to use cursor in an await loop!
    while (await prs.hasNext()) {
      const pr = await prs.next();
      const result = await new PriceRequestUpdateMail(
        pr._id,
        log
      ).processMails();
      results.push(result);
    }
    log.push(`prs mails done`);
    return { log, results };
  } catch (error) {
    console.error(error);
    return { log, error: error.message };
  }
};

addCron({
  name: "Send priceRequest update emails to carriers",
  logging: true,

  // schedule: "5 minute", // don't use 60 minutes , minutes only <60
  interval: 60 * 5,
  job(cronLog = []) {
    cronLog.push("start cron job");
    try {
      MeteorPromise.await(findPriceRequestsToProcessMails(cronLog));
      return { result: "done.." };
    } catch (error) {
      return { error: error.message };
    }
  }
});
