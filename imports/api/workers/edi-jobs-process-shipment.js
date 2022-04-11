// collections
import { EdiJobs } from "/imports/api/jobs/Jobs";
import { importProcessWorker } from "/imports/api/imports/services/shipmentImportWorker";

const debug = require("debug")("imports:edi process jobs");

// this job is triggered by the import process.
// allows import to be done async
debug("Edi process jobs loaded");
// eslint-disable-next-line func-names
Meteor.startup(function() {
  debug("edi process jobs called on starup, setup worker");
  return EdiJobs.processJobs(
    "process.shipment",
    {
      concurrency: 10,
      prefetch: 10
    },
    importProcessWorker
  );
});
