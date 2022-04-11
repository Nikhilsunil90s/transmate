import { Meteor } from "meteor/meteor";
import { Shipment } from "/imports/api/shipments/Shipment.js";

// import { check } from "/imports/utils/check.js";
import { syncExactPartner } from "/imports/api/exactOnline/exact-sync-partner.js";
import { syncExactCost } from "/imports/api/exactOnline/exact-sync-cost.js";
import { getBidMetaData } from "/imports/api/shipments/services/shipment-meta-data.js";

// worker
import { EdiJobs } from "/imports/api/jobs/Jobs";

const debug = require("debug")("exact:price-request:confirm-selected-rate");

// job to process mails
// eslint-disable-next-line func-names
Meteor.startup(function() {
  debug("add worker to process exact price.");
  return EdiJobs.processJobs(
    "script.exactOnline.price.confirmation",
    {
      concurrency: 1,
      prefetch: 1,
      workTimeout: 60 * 1000
    },
    async (job, callback) => {
      const { shipmentId } = job.data || {};
      check(shipmentId, String);
      try {
        job.log(`start process`);
        job.log(`get shipment data for ${shipmentId}`);

        // get userId of user that linked the exact app
        const shipment = await Shipment.first(shipmentId, {
          fields: {
            "references.number": 1,
            accountId: 1,
            "edi.exact": 1
          }
        });
        const {
          accountId,
          edi: {
            exact: { division, deliveryNumber }
          },
          references: { number: referenceNumber }
        } = shipment;
        job.log(`get meta bid data for ${shipmentId}`);
        const { compareAmount, carrierId, ediId, carrierName } =
          (await getBidMetaData(shipmentId)) || {};
        debug("job:process start.", accountId, referenceNumber);
        job.log(`sync partner ${carrierId} , ediId ${ediId}`);
        let partnerEdiId = ediId;
        if (!ediId) {
          // no ediEdi found lets get one
          partnerEdiId = await syncExactPartner({
            division,
            carrierId,
            name: `TM_${carrierName} (${carrierId})`,
            accountId
          });
          job.log(`new parnter linked ${carrierId} , ediId ${partnerEdiId}`);
        }
        job.log(`sync cost ${compareAmount}`);
        const cost = await syncExactCost({
          division,
          deliveryNumber,
          ediId: partnerEdiId, // partner
          totalCostEur: compareAmount,
          trackingNumber: `T_COST-${referenceNumber || shipment._id}`
        });
        debug("job:process finish.");

        job.done({ partnerEdiId, cost });
      } catch (error) {
        job.fail(`Error : ${error.message}`);
      }

      return callback();
    }
  );
});
