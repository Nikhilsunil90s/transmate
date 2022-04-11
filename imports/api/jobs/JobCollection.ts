import { Mongo } from "meteor/mongo";

import Queue from "bull";
import { BullJob } from "./BullJobs";
import {
  JobProcessFunction,
  JobProcessOptions,
  LogOptions
} from "./JobConstants";

const { RedisConnection } = require("@transmate-eu/ibm-function-basis");

const debug = require("debug")("job:JobCollection");

class JobCollection {
  _collection: any;

  jobServerOn: boolean;

  suspendingWorkers: {
    name: string;
    options: JobProcessOptions;
    jobFunction: JobProcessFunction;
  }[] = [];

  // eslint-disable-next-line no-undef
  queues: Record<string, any> = {};

  constructor(name: string) {
    this._collection = new Mongo.Collection(name);
  }

  getQueue(name: string) {
    if (!this.queues[name]) {
      //  see https://github.com/OptimalBits/bull/issues/873
      this.queues[name] = this.setupQueue(name);
    }

    return this.queues[name];
  }

  // eslint-disable-next-line class-methods-use-this
  setupQueue(name: string) {
    const { REDIS_URL } = process.env;
    if (!REDIS_URL) throw new Error("REDIS_URL is missing!");
    const redisSetup = { redis: RedisConnection.connectionParams(REDIS_URL) };
    debug("redis connectionParams %o", redisSetup);
    const queue = new Queue(name, redisSetup);

    queue.on("waiting", (job: any) => {
      debug("waiting event", job);

      // TODO:check the args
      const jobId = job.id;

      // A Job is waiting to be processed as soon as a worker is idling.
      this._collection.update(jobId, {
        $set: {
          status: "waiting",
          updated: {
            at: new Date()
          }
        }
      });
    });

    queue.on("active", (job: any) => {
      const jobId = job.id;

      // A job has started. You can use `jobPromise.cancel()`` to abort it.
      this._collection.update(jobId, {
        $set: {
          status: "running",
          updated: {
            at: new Date()
          }
        }
      });
    });

    queue.on("completed", (job: any, result: any) => {
      const jobId = job.id;

      // A job successfully completed with a `result`.
      this._collection.update(jobId, {
        $set: {
          status: "completed",
          result,
          updated: {
            at: new Date()
          }
        }
      });
    });

    queue.on("failed", (job: any, err: any) => {
      const jobId = job.id;

      // A job failed with reason `err`!
      this._collection.update(jobId, {
        $set: {
          status: "failed",
          updated: {
            at: new Date()
          }
        },
        $push: {
          log: {
            time: new Date(),
            level: "danger",
            message: err?.message
          },
          failures: {
            time: new Date(),
            message: err?.message
          }
        }
      });
    });

    return queue;
  }

  async getPrTokens({ priceRequestId }) {
    const cursor = await this._collection.find(
      {
        name: "process.email.send",
        "data.input.data.request": true,
        "data.input.meta.id": priceRequestId,
        "data.input.meta.type": "priceRequest"
      },
      {
        fields: {
          "data.input.data.token": 1,
          "updated.at": 1,
          "data.input.meta.userId": 1,
          "data.input.meta.accountId": 1
        },
        sort: {
          "updated.at": -1
        }
      }
    );
    return cursor.fetch();
  }

  // eslint-disable-next-line class-methods-use-this
  startJobServer() {
    this.jobServerOn = true;
    this.suspendingWorkers.map(({ name, options, jobFunction }) => {
      // eslint-disable-next-line no-underscore-dangle
      return this._doProcessJob(name, options, jobFunction);
    });
    this.suspendingWorkers = [];
  }

  saveJob(job: BullJob) {
    // compliance to https://github.com/vsivsi/meteor-job-collection/#job-document-data-models
    const dbObj = {
      _id: job.id,
      name: job.options.name,
      data: job.data,
      created: {
        at: new Date()
      }
    };

    //
    return this._collection.insert(dbObj);
  }

  processJobs(
    name: string,
    options: JobProcessOptions,
    jobFunction: JobProcessFunction
  ) {
    if (!this.jobServerOn) {
      // console.warn("job server is not setup to process job", name);
      this.suspendingWorkers.push({
        name,
        options,
        jobFunction
      });

      return;
    }
    // eslint-disable-next-line no-underscore-dangle
    this._doProcessJob(name, options, jobFunction);
  }

  _doProcessJob(
    name: string,
    options: JobProcessOptions,
    jobFunction: JobProcessFunction
  ) {
    const queue = this.getQueue(name);
    debug("processJobs", name);

    //  TODO:calllback?
    const callback = () => {};

    const processFunc = async (
      job: any,
      done: (arg0: Error, arg1?: string) => void
    ) => {
      const jobObj = {
        data: job.data,
        log: (message: string, logOptions?: LogOptions) => {
          job.log(message);
          // eslint-disable-next-line no-unused-expressions
          logOptions?.echo && console.log(message);

          const logRow = {
            time: new Date(),

            // runId:   ,
            // level:   Match.Where(validLogLevel),
            message,
            ...(logOptions?.data ? { data: logOptions.data } : {}),
            ...(logOptions?.level ? { level: logOptions.level } : {})
          };

          // : log to mongo
          this._collection.update(job.id, {
            $push: {
              log: logRow
            }
          });
        },
        done: (message: string) => {
          done(null, message);
        },
        result: (data: any) => {
          done(null, data);
        },
        fail: (message: string) => {
          done(new Error(message));
        },
        progress: (percents: number) => {
          job.progress(percents);
        }
      };
      try {
        await jobFunction(jobObj, callback);

        debug(name);
      } catch (err) {
        done(err);
        debug("job error", name, err);
      }
    };
    queue.process(name, options.concurrency, processFunc);
  }

  find(...args) {
    return this._collection.find(...args);
  }

  // https://docs.meteor.com/api/collections.html#Mongo-Collection-remove
  remove(...args) {
    // TODO: need cancel?
    return this._collection.remove(...args);
  }

  //  https://github.com/vsivsi/meteor-job-collection/#jccanceljobsids-options-callback---anywhere
  //  TODO:need check
  async cancelJobs(ids: string[]) {
    const dbJobs = await this._collection
      .find(
        {
          _id: {
            $in: ids
          }
        },
        {
          fields: {
            _id: 1,
            name: 1,
            status: 1
          }
        }
      )
      .fetch();

    // use remove as there are no cancel
    const promises = ids.map(async (jobId: string) => {
      const jobData = await dbJobs.find(jobi => jobi._id === jobId);
      if (!jobData) {
        debug("can not found job", jobId);
        return null;
      }
      const jobBull = await this.getQueue(jobData.name).getJob(jobId);

      if (!jobBull) return null;

      // how to cancel?
      // https://github.com/OptimalBits/bull/issues/114
      // await jobBull.discard();
      // await jobBull.moveToFailed(new Error("job canceled"));

      // or like this
      await jobBull.remove();
      return true;
    });

    await Promise.all(promises);

    // :do we need update the status to cancel
    // force update, not very accurate
    this._collection.update(
      {
        _id: {
          $in: ids
        }
      },
      {
        $set: {
          status: "cancelled"
        }
      },
      {
        multi: true
      }
    );
  }

  _dropIndex(...args: { data: number }[]) {
    // eslint-disable-next-line no-underscore-dangle
    return this._collection._dropIndex(...args);
  }

  createIndex(
    ...args: {
      "updated.at"?: number;
      "data.importId"?: number;
      status?: number;
      "data.userId"?: number;
      depends?: number;
      created?: number;
      expireAfterSeconds?: number;
      type?: number;
      runId?: number;
      priority?: number;
      retryUntil?: number;
      after?: number;
    }[]
  ) {
    return this._collection.createIndex(...args);
  }
}

export default JobCollection;
