import fetch from "@adobe/node-fetch-retry";
import { addCron } from "./cron";

const debug = require("debug")("cron:heartbeat");

if (process.env.HEARTBEAT_URL) {
  // call url to confirm running jobs
  addCron({
    name: "Send a heartbeat",

    // schedule: "1 minute", // don't use 60 minutes , minutes only <60
    interval: 60,
    async job(cronLog = []) {
      try {
        cronLog.push("start call heartbeat url");

        // always return fibers in synced cron
        debug("call url to confirm jobs are running");
        await fetch(process.env.HEARTBEAT_URL);
        return { result: "heartbeat send" };
      } catch (error) {
        return { error: error.message };
      }
    }
  });
}
