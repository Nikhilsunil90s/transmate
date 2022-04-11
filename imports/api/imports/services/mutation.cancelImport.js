import { Import } from "/imports/api/imports/Import-shipments";
import { EdiJobs } from "/imports/api/jobs/Jobs";

import SecurityChecks from "/imports/utils/security/_security";

export const cancelImport = ({ accountId, userId }) => ({
  accountId,
  userId,
  async init({ importId }) {
    this.importId = importId;
    this.imp = await Import.first(importId, {
      fields: { _id: 1, progress: 1 }
    });
    SecurityChecks.checkIfExists(this.imp);
    return this;
  },
  async cancel() {
    const col = await EdiJobs.find(
      {
        "data.importId": this.importId,
        status: { $in: ["ready", "waiting", "paused"] }
      },
      { fields: { _id: 1 } }
    ).fetch();
    const jobIds = col.map(({ _id }) => _id);

    if (jobIds != null ? jobIds.length : undefined) {
      EdiJobs.cancelJobs(jobIds, {
        antecedents: false,
        dependents: false
      });
    }

    this.imp.update_async({ "progress.process": 100 });
    return this;
  },
  getUIResponse() {
    return this.imp.reload();
  }
});
