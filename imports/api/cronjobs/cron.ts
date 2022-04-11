import { Severity, captureException, addBreadcrumb } from "@sentry/node";
import createBullQueue from "./createBullQueue";
import { CronLogging } from "./CronLogging";

const debug = require("debug")("cron");

// const debug = console.log;

// status of the bull worker started
let cronServiceStarted = false;

interface CronJobResult {
  result?: string;
  error?: string;
  logs: string[];
  time?: Date;
}

interface CronArgs {
  name: string;

  // cron format
  cron?: string;
  logging?: boolean;

  // interval of seconds, if specified, will ignore cron
  interval?: number;
  job: (cronLog?: any) => Promise<CronJobResult>;
}

const startCache: CronArgs[] = [];

const addRealQueue = ({
  name,
  cron,
  interval,
  job,
  logging = false
}: CronArgs) => {
  // it recommend to create queue for each and not reuse the redis client
  // because of this issue https://github.com/OptimalBits/bull/issues/1192#issuecomment-489566105
  const cronjobName = `cron-${name}`;
  const cronService = createBullQueue(cronjobName);
  cronService.process(cronjobName, async (jobFunction, done) => {
    addBreadcrumb({
      category: "job",
      message: `run job ${cronjobName}`,
      level: Severity.Info,
      data: { job }
    });
    const cronlog = {
      push: logLine => {
        jobFunction.log(logLine);
      }
    };

    let jobresult;
    try {
      jobFunction.log("start");
      jobresult = await job(cronlog);

      const now = new Date();
      jobresult.time = jobresult.time || now;
      jobFunction.log("log to collection");
      if (logging)
        CronLogging._collection.insert({ name, cronjobName, ...jobresult });
    } catch (err) {
      done(err);
    }
    if (jobresult?.error) {
      if (process.env.NODE_ENV === "production") {
        captureException(jobresult?.error);
      } else {
        console.error(
          "cron job with name",
          name,
          " is not successful: ",
          jobresult?.error
        );
      }
      done(new Error(jobresult.error));
    } // send to sentry
    done(null, { name: cronjobName, ...jobresult });
  });

  // see https://github.com/OptimalBits/bull/blob/develop/REFERENCE.md#repeated-job-details
  const repeat = interval ? { every: interval * 1000 } : { cron };
  cronService.add(
    cronjobName,
    {},
    {
      repeat,
      removeOnComplete: 1000,
      removeOnFail: 1000
    }
  );
  debug("addCron", cronjobName, repeat);
};

export const startCronService = async () => {
  // cronService = createBullQueue("CRON");
  cronServiceStarted = true;
  await Promise.all(
    startCache.map(async arg => {
      addRealQueue(arg);
    })
  );

  debug("cron service started...");
};

export const addCron = (arg: CronArgs) => {
  if (!cronServiceStarted) {
    startCache.push(arg);
  } else {
    addRealQueue(arg);
  }
};
