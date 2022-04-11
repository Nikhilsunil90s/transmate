import dot from "dot-object";

import { importService } from "./_importService";
import { initializeMapping } from "./mutation.initializeMapping";
import SecurityChecks from "/imports/utils/security/_security";

import { Import } from "/imports/api/imports/Import-shipments";
import { AllAccountsSettings } from "../../allAccountsSettings/AllAccountsSettings";

export const updateShipmentImport = ({ accountId, userId }) => ({
  accountId,
  userId,
  async init({ importId }) {
    this.importId = importId;
    this.imp = await Import.first(importId);
    SecurityChecks.checkIfExists(this.imp);
    return this;
  },
  async update({ updates }) {
    const dotUpdates = dot.dot(updates);

    await this.imp.update_async(dotUpdates);
    if (!!updates.type) {
      // type has to be listed in account settings:
      // the mapping should be re-evaluated
      await Promise.all([
        AllAccountsSettings._collection.update(this.accountId, {
          $addToSet: { importTypes: updates.type }
        }),
        (async () => {
          if (!this.imp.headers) return;
          const srv = initializeMapping({ accountId, userId });
          await srv.init({ imp: this.imp });
          await srv.initializeMapping(true);
        })()
      ]);
    }
    return this;
  },
  async checkValidationErrors() {
    if (this.imp.progress?.lookup > 0) {
      const srv = importService({
        accountId: this.accountId,
        userId: this.userId
      });
      await srv.init({ imp: this.imp });
      await srv.checkValidationErrors();
    }
    return this;
  },
  getUIResponse() {
    return this.imp.reload();
  }
});
