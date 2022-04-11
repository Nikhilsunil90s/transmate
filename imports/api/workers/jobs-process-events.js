import { EdiJobs } from "/imports/api/jobs/Jobs";

import { exactSaveCosts } from "./services/jobFn.exact.saveCosts";

const fn = {
  exactSaveCosts
};

Meteor.startup(function jobsProcessor() {
  return EdiJobs.processJobs(
    "process.events",
    {
      concurrency: 10,
      prefetch: 10,
      workTimeout: 30 * 1000
    },
    (job, callback) => {
      const { userId, accountId, action, data, references } = job.data;

      if (!action) return job.fail("no action set");

      try {
        job.log(`processing job action ${action} - ${accountId}`);

        const fnToRun = fn[action];
        if (!fnToRun) throw new Error("no function found");

        const result = fnToRun({ userId, accountId, data, references });

        job.done(JSON.parse(JSON.stringify(result)));
      } catch (error) {
        job.fail(`Error running action: ${error.message}`);
      }

      return callback();
    }
  );
});
