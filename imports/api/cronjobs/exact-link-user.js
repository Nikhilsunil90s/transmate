import { addCron } from "./cron";
import { checkAndProcessUserActions } from "/imports/api/exactOnline/exact-link-user.js";

const debug = require("debug")("exactOnline:cron");

addCron({
  name: "Check exact-online users",

  // schedule: "1 minute", // don't use 60 minutes , minutes only <60
  interval: 60,
  async job(cronLog = []) {
    try {
      cronLog.push("start");

      // always return fibers in synced cron
      debug("start cron to check users with exact info");
      const result = await checkAndProcessUserActions(cronLog);
      debug("end cron to check users with exact info %o", result);
      cronLog.push("finish");
      return { result: "done..." };
    } catch (error) {
      return { error: error.message };
    }
  }
});
