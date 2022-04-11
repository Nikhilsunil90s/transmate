/* eslint-disable no-underscore-dangle */
import { ImportProcesser } from "/imports/api/imports/services/shipmentImportProcesser";
import { oPath } from "/imports/utils/functions/path";
import { callCloudFunction } from "/imports/utils/server/ibmFunctions/callFunction";
import { shipmentImportProgressUpdate } from "/imports/api/imports/server/services/shipmentImport-progressUpdate";
import { Job } from "/imports/api/jobs/JobConstants";

const debug = require("debug")("imports:importProcessWorker");

/** worker that prepares data for import and then calls the import api fn */
export const importProcessWorker = async (job: Job, callback: () => void) => {
  const { userId, accountId, importId, number } = job.data;
  debug("arrived in importProcessWorker", {
    userId,
    accountId,
    importId,
    number
  });

  // Fetch row data
  job.log("Fetching data", { echo: true });
  const importProcess = new ImportProcesser({ accountId });
  await importProcess.init({ importId, number });
  debug("import has %s rows", oPath(["rows", "length"], importProcess));
  if (!importProcess.hasRows()) {
    return job.fail(
      `No rows found for query { ${importProcess.numberCol}: ${number} }`
    );
  }
  job.log("Pivoting data");
  const { shipment, errors } = importProcess.prepareShipmentData().get();

  if (errors?.length) {
    job.fail(JSON.stringify(errors));
    throw errors;
  }
  debug("shipment data %o", shipment);
  job.log("apiData", {
    data: { shipment, errors },
    echo: true
  });

  // api call
  const data = {
    shipment,
    references: { accountId, creatorId: userId, importSource: "transmateApp" }
  };

  const resultApi = callCloudFunction("CreateShipmentInvoiceCost", data, {
    userId,
    accountId
  });

  resultApi
    .then(({ result }) => {
      debug("resultApi final result %j", result);
      return job.done(result);
    })
    .catch(error => {
      debug("resultApi final error", error);
      job.fail(error.message);
    })
    .finally(() => {
      shipmentImportProgressUpdate({ userId, accountId }).update({ importId });
    });

  // the user needs progress stats:

  return callback();
};
