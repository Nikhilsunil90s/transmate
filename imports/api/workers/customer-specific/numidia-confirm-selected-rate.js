import { Shipment } from "/imports/api/shipments/Shipment.js";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts.js";
import { Meteor } from "meteor/meteor";
import { check } from "/imports/utils/check.js";
import { calculateTotalCost } from "/imports/utils/functions/recalculateCosts.js";
import { callCloudFunction } from "/imports/utils/server/ibmFunctions/callFunction";

import { EdiJobs } from "/imports/api/jobs/Jobs";
import newJob from "../../jobs/newJob";

const fetch = require("@adobe/node-fetch-retry");

const debug = require("debug")("price-request:confirm-selected-rate");

/**
 * specific numidia function to confirm rates
 * @param {String}
 */

const JOB_NAME = "script.numdia.price.confirmation";

export class NumidiaPriceSelect {
  constructor({ shipmentId, numidiaPriceConfirmUrl }) {
    check(shipmentId, String);
    this.shipmentId = shipmentId;
    this.numidiaPriceConfirmUrl = numidiaPriceConfirmUrl;
    return this;
  }

  async scheduleJob(secondsDelay = 0) {
    // check if we have enough data for the job
    const { shipmentId } = this;
    check(shipmentId, String);
    newJob(EdiJobs, JOB_NAME, { shipmentId })
      .delay(secondsDelay * 1000)
      .priority("high")
      .retry({
        retries: 2,
        wait: 20000 // 20 sec
      })
      .timeout(60 * 1000)
      .save();

    // return class for testing
    return { ok: true, class: this };
  }

  async send() {
    // get costs
    const { shipmentId } = this;
    check(shipmentId, String);
    debug("start send rate to numidia (soap)", { shipmentId });
    const shipment = await Shipment.first(shipmentId, {
      fields: { costs: 1, accountId: 1, carrierIds: 1, "created.by": 1 }
    });
    debug("shipment data:%o", shipment);
    try {
      if (!shipment.carrierIds || !shipment.carrierIds[0])
        throw new Meteor.Error(
          `${shipmentId} has no carrier selected (anymore)!`
        );

      // get carrier EDI id
      // use first carrier (assumption  only 1 carrier in this)
      // calculate total on main cost currency
      debug("get account data %j", {
        ediId: shipment.accountId,
        _id: shipment.carrierIds[0]
      });
      const { profile, ediId: vendor } = await AllAccounts.getProfileData({
        accountId: shipment.carrierIds[0],
        myAccountId: shipment.accountId
      });
      debug("carrier account data:%o", profile);
      debug("vendor data:%o", vendor);
      if (!profile)
        throw new Meteor.Error(
          `${shipment.carrierIds[0]} edi account not found!`
        );

      // take first from array , assumption only 1 edi id per account!

      const calculateTotalCostResult = await calculateTotalCost(shipment.costs);

      const { amount, currency, recalculatedCosts } = calculateTotalCostResult;
      debug("recalculatedCosts %o", recalculatedCosts);
      debug("send amount %o", amount);
      const target = process.env.REPORTING_TARGET;
      check(target, String);

      // check data before sending
      check(amount, Number);
      check(shipmentId, String);
      check(vendor, String);
      check(currency, String);

      let resultApi;
      if (target === "live") {
        resultApi = await callCloudFunction(
          "confirmNumidiaRate",
          {
            tenderId: shipmentId,
            vendor,
            amount,
            currency
          },
          { userId: (shipment.created || {}).by, accountId: shipment.accountId }
        );
      } else {
        if (typeof this.numidiaPriceConfirmUrl !== "string")
          throw Error("numidiaPriceConfirmUrl not set!");
        const headers = {
          "Content-Type": "application/json",
          Accept: "application/json"
        };
        const res = await fetch(this.numidiaPriceConfirmUrl, {
          method: "POST",
          body: JSON.stringify({
            tenderId: shipmentId,
            vendor,
            amount,
            currency
          }),
          headers
        });
        if (!res || !res.ok) {
          console.error("ERROR response numidia api", res);
          throw Error(
            "Issue when calling numidia price confirmation api, wrong status received"
          );
        }

        resultApi = await res.text();
      }

      debug("result numidia %o", resultApi);
      const result = {
        request: {
          tenderId: shipmentId,
          vendor,
          amount,
          currency
        },
        url: this.numidiaPriceConfirmUrl,
        target,
        resultApi,
        dt: new Date()
      };
      debug("store in db call and amount %o", resultApi);
      await shipment.push({
        "edi.numidiaPriceConfirmations": result
      });

      return result;
    } catch (error) {
      console.error(
        "set error on numidia price confirmation : ",
        shipmentId,
        error
      );
      await Shipment._collection.update(
        { _id: shipmentId },
        {
          $push: {
            errors: {
              type: "numidia-price-confirmation",
              message: error.message,
              dt: new Date()
            }
          },
          $addToSet: { flags: "has-errors" }
        }
      );
      throw error;
    }
  }
}

// job to process mails
// eslint-disable-next-line func-names
Meteor.startup(function() {
  debug("add worker to process numidia price.");
  return EdiJobs.processJobs(
    JOB_NAME,
    {
      concurrency: 1,
      prefetch: 1
    },
    async (job, callback) => {
      const { shipmentId, numidiaPriceConfirmUrl } = job.data || {};
      check(shipmentId, String);
      try {
        job.log(`start process`);
        debug("job:process start.", shipmentId);
        const action = await new NumidiaPriceSelect({
          shipmentId,
          numidiaPriceConfirmUrl
        }).send();
        debug("job:process finish.", shipmentId);

        if (Array.isArray(action.warnings))
          job.log("warnings", {
            level: "warning",
            data: { warnings: action.warnings }
          });
        job.done(action);
      } catch (error) {
        job.fail(`Error : ${error.message}`);
      }

      return callback();
    }
  );
});
