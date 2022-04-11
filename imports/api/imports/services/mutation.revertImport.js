import { Import } from "/imports/api/imports/Import-shipments";
import { EdiJobs } from "/imports/api/jobs/Jobs";
import { Shipment } from "/imports/api/shipments/Shipment";

import { Notification } from "/imports/api/notifications/Notification";
import SecurityChecks from "/imports/utils/security/_security";
import { deleteShipment } from "/imports/api/shipments/services/mutation.deleteShipment";

export const revertImport = ({ accountId, userId }) => ({
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

    const shipments = await Shipment.where(
      { [`edi.account.${this.accountId}.importId`]: this.importId },
      { fields: { _id: 1 } }
    );

    const deleteShipmentSrv = deleteShipment({ accountId, userId });
    shipments.forEach(shipment => deleteShipmentSrv.delete(shipment.id));

    await this.imp.update_async({
      "progress.process": 0,
      "progress.jobs": 0,
      "progress.mapping": 100,
      total: {}
    });

    Notification._collection.remove({ "data.importId": this.importId });

    return this;
  },
  getUIResponse() {
    return this.imp.reload();
  }
});
