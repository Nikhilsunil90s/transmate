// collections
import { EdiJobs } from "/imports/api/jobs/Jobs";
import { priceRequestService } from "/imports/api/priceRequest/services/priceRequest";
import { PriceList } from "/imports/api/pricelists/PriceList";

const debug = require("debug")("edijobs:process:pricerequests");

// this job is triggered by the import process.
// allows import to be done async

// eslint-disable-next-line func-names
Meteor.startup(function() {
  debug("EdiJobs process to do pricerequests jobs.");
  return EdiJobs.processJobs(
    "process.priceRequest.recalculate",
    {
      concurrency: 1,
      prefetch: 1
    },
    async (job, callback) => {
      const { priceRequestId } = job.data || {};
      if (!priceRequestId) {
        job.fail(`no id in data`);
      }
      try {
        job.log(`start calculation for ${priceRequestId}`);
        const pr = await priceRequestService({}).init({ priceRequestId });

        // check if there are price lists
        const pricelists = await PriceList.find(
          { priceRequestId },
          { fields: { _id: 1, status: 1 } }
        ).fetch();
        debug("pricelists to check ", pricelists.length);
        job.log(
          `pricelistst linked to pricerequest:${(
            pricelists.map(pl => pl._id) || []
          ).join(",")}`
        );
        const result = await pr.getAnalyse();
        debug("priceRequestService getAnalyse finished for %s ", result._id);
        if (!result || !result.calculation) {
          job.done(`no calculation data returns...`);
        } else {
          // stringify and parse to avoid errors on job (must be object)
          job.done(JSON.parse(JSON.stringify(result.calculation)));
        }
      } catch (error) {
        job.fail(`Error calculation pricerequest: ${error.message}`);
      }

      return callback();
    }
  );
});
