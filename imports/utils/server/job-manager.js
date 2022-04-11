/* eslint-disable no-restricted-syntax */
import { captureException } from "@sentry/node";
import { Meteor } from "meteor/meteor";

// worker
import { EdiJobs } from "/imports/api/jobs/Jobs";
import newJob from "/imports/api/jobs/newJob";

const debug = require("debug")("notifications");

const NOTIFICATION_JOB_NAME = "process.notifications";

const registeredJobs = [];
export class JobManager {
  static post(name, object, info) {
    debug(`register event for ${name}, object: ${JSON.stringify(object)}`);

    // notifications.emit(name, { name, object, info });
    // run job
    registeredJobs
      .filter(el => el.name === name)
      .forEach(({ eventId }) => {
        return newJob(EdiJobs, NOTIFICATION_JOB_NAME, {
          name,
          object,
          info,
          eventId
        })
          .timeout(10 * 1000)
          .save();
      });
  }

  static on(name, eventId, fn) {
    if (typeof name !== "string" || typeof eventId !== "string")
      throw Error(
        `events should be registered with an name and eventId - ${name}`
      );

    // we need to code eventId (unique) to make this work with multiple servers
    debug("add job for name %o", name);
    if (registeredJobs.find(el => el.name === name && el.eventId === eventId))
      throw Error("duplicate eventId!, modify your code!");
    registeredJobs.push({ name, fn, eventId });

    // add function to run when name is triggered
  }
}

Meteor.startup(() => {
  // show listeners registered after startup
  setTimeout(() => {
    debug(
      "jobs linked to jobManager %o",
      registeredJobs.map(el => el.name)
    );
  }, 1000);

  EdiJobs.processJobs(
    NOTIFICATION_JOB_NAME,
    {
      concurrency: 10
    },
    async (job, done) => {
      const { name, object, info, eventId } = job.data || {};
      const jobsToRun = registeredJobs.find(
        el => el.name === name && el.eventId === eventId
      );
      if (!jobsToRun) {
        job.log(`no functions listed for ${name} with eventId ${eventId}`);
        job.progress(100);
      } else {
        try {
          job.log(`start ${name}`);
          job.progress(10);

          const result = await jobsToRun.fn({ name, object, info });
          job.log(`finished ${name}`);
          job.progress(100);
          job.result(result);
        } catch (error) {
          if (process.env.NODE_ENV === "production") {
            debug("error send to sentry ", error);

            // send to sentry
            captureException(error);
          } else {
            console.error("notification error", error);
          }
          job.fail(`Error calculation pricerequest: ${error.message}`);
        }
      }

      done();
    }
  );
});
