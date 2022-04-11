import { Import } from "/imports/api/imports/Import-shipments";
import { EdiJobs } from "/imports/api/jobs/Jobs";

import SecurityChecks from "/imports/utils/security/_security";

export const restartImport = ({ accountId, userId }) => ({
  accountId,
  userId,
  async init({ importId }) {
    this.importId = importId;
    this.imp = await Import.first(importId, {
      fields: { _id: 1, progress: 1, total: 1 }
    });
    SecurityChecks.checkIfExists(this.imp);
    return this;
  },
  async revert() {
    EdiJobs.remove({ "data.importId": this.importId });

    this.imp.update_async({
      "progress.process": 0,
      "progress.jobs": 0,
      "progress.mapping": 0,
      "progress.data": 0,
      "progress.lookup": 0,
      headers: [],
      mapping: null,
      total: {},
      errors: null
    });

    return this;
  },
  getUIResponse() {
    return this.imp.reload();
  }
});
