import { JobManager } from "../../../utils/server/job-manager.js";
import { EdiJobs } from "../../jobs/Jobs";
import { AllAccountsSettings } from "/imports/api/allAccountsSettings/AllAccountsSettings";
import newJob from "../../jobs/newJob";

const debug = require("debug")("notification:triggerJob");

// entry point for customer specific scripts!
// ie Numdia confirmNumidiaPriceSelect S46614

/** function that will check if an account has an action set up for a trigger
 * if an action is found, a worker job will be created (and later executed)
 * job listener is "events  "
 * @param {Object} param
 * @param {String} accountId
 * @param {String} userId
 * @param {String} event key of event e.g. "shipment.release"
 * @param {Object} data all relevant data for the worker action to run
 *
 * actions the database are stored as
 * on: key
 * action: name of function
 * active: boolean
 * data: additional data for the function
 */

export const triggerWorkerJob = ({ accountId, userId, event, data }) => ({
  errors: [],
  logging: [],
  accountId,
  userId,
  event,
  data,

  triggerNotifications() {
    debug("setup nofications for ", this.accountId, this.event, this.data);

    // ie trigger notifications "shipment-stage.released"
    JobManager.post(this.event, this.data);
  },
  async getSettings() {
    try {
      this.logging.push(
        `check if account ${this.accountId} needs specific jobs`
      );
      const pipeline = [
        { $match: { _id: this.accountId, "actions.on": this.event } },
        {
          $project: {
            job: {
              $filter: {
                input: { $ifNull: ["$actions", []] },
                cond: {
                  $and: [
                    { $eq: ["$$this.on", this.event] },
                    { $eq: ["$$this.active", true] }
                  ]
                }
              }
            }
          }
        },
        {
          $unwind: "$job"
        }
      ];
      debug(
        " db.getCollection('accounts.settings').aggregate(   %j  );",
        pipeline
      );
      const actions = await AllAccountsSettings._collection.aggregate(pipeline);

      debug("aggregation : %o", actions);

      this.hasAction = actions.length > 0;
      this.logging.push(
        `account ${this.accountId} has ${actions.length} specific actions.`
      );
      this.actions = actions;
    } catch (error) {
      console.error(error);
      this.errors.push(error);
      this.hasAction = false;
      this.actions = [];
    }
  },
  async setJobs() {
    try {
      await Promise.all(
        this.actions.map(action => {
          const { job } = action || {};
          debug("setup job for %o ", job);
          this.logging.push(
            `run specific action ${job.action}  for  ${this.accountId}.`
          );

          // for example: "script.numdia.price.confirmation";
          const jobClass = newJob(EdiJobs, job.action, {
            ...job.data, // will set defaults like ie numidia url for confirmations
            ...this.data,
            target: process.env.REPORTING_TARGET,
            userId: this.userId,
            accountId: this.accountId
          });
          const { options } = job || {};
          debug("set options %o", options);
          if (options.retry) jobClass.retry(options.retry);
          if (options.delay) jobClass.delay(options.delay);
          if (options.priority) jobClass.priority(options.priority);

          return jobClass.save();
        })
      );
    } catch (error) {
      console.error(error);
      this.errors.push(error);
    }
  },

  // this is the entry point:
  async go() {
    this.triggerNotifications();
    await this.getSettings();
    if (!this.hasActions) await this.setJobs();
    debug("this", this.logging);
    return { ok: true, actions: this.actions };
  }
});

// example actions object:
// actions: [
//  { on: "stage.release", action: "exactSaveCosts", active: true, data: {} }
// ];
