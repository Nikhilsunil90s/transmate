/* eslint-disable no-undef */

import { PriceRequest } from "/imports/api/priceRequest/PriceRequest";
import { EdiJobs } from "/imports/api/jobs/Jobs";
import newJob from "/imports/api/jobs/newJob";

Migrations.add({
  version: 42,
  name: "recalculate through jobs all not closed price requests",
  up: () => {
    const prs = PriceRequest.find(
      { status: { $ne: "deleted" } },
      { fields: { _id: 1 } }
    );

    prs.forEach(pr => {
      newJob(EdiJobs, "process.priceRequest.recalculate", {
        priceRequestId: pr._id
      })
        .timeout(60 * 1000)
        .save();
    });
  }
});
