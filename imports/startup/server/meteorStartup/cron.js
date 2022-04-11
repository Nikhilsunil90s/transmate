import { Meteor } from "meteor/meteor";
import { startCronService } from "/imports/api/cronjobs/cron";
import { EdiJobs } from "/imports/api/jobs/Jobs";
import { Settings } from "/imports/api/settings/Settings";

// const debug = require("debug")("worker:start");
const { RedisConnection } = require("@transmate-eu/ibm-function-basis");

Meteor.startup(async function startSyncedCron() {
  if (process.env.PROCESS_WORKER_JOBS !== "true") {
    console.warn(
      "Cron will not be started on development env, set PROCESS_WORKER_JOBS env if needed!!!"
    );
    return false;
  }

  // test redis connections
  const REDIS_URI = process.env.REDIS_URL;
  const redis = new RedisConnection(REDIS_URI);
  await redis.test(); // test if connection works! will throw if not!
  // check if we need to reset redisDB
  const redisSettings = await Settings.first("redis", {
    fields: { flushOnNextBoot: 1 }
  });
  if (!redisSettings || !redisSettings.flushOnNextBoot === false) {
    // check if we have need to flush db (normally best to do on jobs changes);
    // flush if needed and update settings
    console.log("flush redis db!");
    await redis.client.flushdb();
    await Settings._collection.update(
      { _id: "redis" },
      {
        $set: { flushOnNextBoot: false }
      },
      { upsert: true }
    );
  }
  console.log("start worker jobs...");
  EdiJobs.startJobServer();

  // test cron before started
  // addCron({
  //   name: "testbefore",
  //   interval: 10,
  //   job: async () => {
  //     console.log("testbefore done");
  //     return { logs: [""] };
  //   }
  // });

  startCronService();

  // test cron after started
  // addCron({
  //   name: "testafter",
  //   interval: 11,
  //   job: async () => {
  //     console.log("testafter done");
  //     return { logs: [""] };
  //   }
  // });

  return true;
});
