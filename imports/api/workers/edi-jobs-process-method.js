import { EdiJobs } from "/imports/api/jobs/Jobs";

// used for invoice import -> method: "dataImport.invoiceLines"
// used for partners import -> method: "dataImport.partners"
// used for address import -> method: "dataImport.address"
import { dataImportPartner } from "/imports/api/imports/services/dataImportHandler-partner";
import { dataImportInvoiceLines } from "/imports/api/imports/services/dataImportHandler-invoiceLines";
import { dataImportAddres } from "/imports/api/imports/services/dataImportHandler-address";

// eslint-disable-next-line func-names
Meteor.startup(function() {
  return EdiJobs.processJobs(
    "process.method",
    {
      concurrency: 10,
      prefetch: 10
    },
    (job, callback) => {
      const { userId, accountId, importId, type, data, references } = job.data;

      let fnToCall;

      switch (type) {
        case "address": {
          fnToCall = dataImportAddres;
          break;
        }
        case "partners": {
          fnToCall = dataImportPartner;
          break;
        }
        case "invoice": {
          fnToCall = dataImportInvoiceLines;
          break;
        }
        default:
          return job.fail(`Action ${type} not set-up for row ${data.rowNum}`);
      }

      return fnToCall({ accountId, userId })
        .run({ importId, data, references })
        .then(r => {
          job.done(r);
        })
        .catch(error => {
          job.log(JSON.stringify(error), { level: "danger" });
          job.fail(`Error importing item: ${error.message}`);
        })
        .finally(callback);
    }
  );
});
