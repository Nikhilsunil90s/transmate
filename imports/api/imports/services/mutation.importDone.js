import { Import } from "/imports/api/imports/Import-shipments";

import SecurityChecks from "/imports/utils/security/_security";

export const importDone = ({ accountId, userId }) => ({
  accountId,
  userId,
  async init({ importId }) {
    this.importId = importId;
    this.imp = await Import.first(importId, { fields: { _id: 1 } });
    SecurityChecks.checkIfExists(this.imp);
    return this;
  },
  async flagDone() {
    await this.imp.update_async({ "progress.data": 100 });
    return this;
  },
  getUIResponse() {
    return this.imp.reload();
  }
});
