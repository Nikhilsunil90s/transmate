import { EdiJobs } from "/imports/api/jobs/Jobs";
import { EdiRows } from "/imports/api/imports/Import-shipments-rows";
import { Import } from "/imports/api/imports/Import-shipments";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import newJob from "../../jobs/newJob";

const debug = require("debug")("imports:import-data");

const WORKER_ACTION = "process.shipment";

export const processImport = ({ userId, accountId }) => ({
  userId,
  accountId,
  async init({ importId }) {
    this.importId = importId;
    this.imp = await Import.first(importId);
    this.account = await AllAccounts.first(accountId);
    return this;
  },
  async process() {
    debug("starting import process for %s", this.imp.id);
    await this.imp.update_async({
      "progress.mapping": 100,
      "progress.jobs": 0,
      "progress.process": 0
    });
    const numberCol = this.imp.getHeader("shipment.references.number");
    let numEmpty = 0;
    let numShipments = 0;
    let progressJobs = 0;

    // Create processing jobs, one for each shipment number so they can be run
    // in parallel
    const numbers = await EdiRows.rawCollection().distinct(
      `data.${numberCol}`,
      { importId: this.importId }
    );
    await this.imp.update_async({ "total.shipments": numbers.length });
    numbers.forEach(number => {
      if (!number) {
        numEmpty += 1;
        return;
      }
      newJob(EdiJobs, WORKER_ACTION, {
        userId: this.userId,
        accountId: this.account._id,
        importId: this.importId,
        number
      })
        .timeout(30 * 1000)
        .save(() => {});

      numShipments += 1;
      const percent = Math.round(
        ((numEmpty + numShipments) / numbers.length) * 100
      );
      if (percent !== progressJobs) {
        progressJobs = percent;
        this.imp.update_async({ "progress.jobs": progressJobs });
      }
    });
    this.imp.update_async({
      "total.shipments": numShipments,
      "total.jobs": numShipments
    });
    if (numEmpty) {
      this.imp.update_async({ "total.empty": numEmpty });
      throw new Error(
        "import.process.skipped",
        `Skipped ${numEmpty} rows with empty shipment number`
      );
    }
    return this.imp.reload();
  }
});
