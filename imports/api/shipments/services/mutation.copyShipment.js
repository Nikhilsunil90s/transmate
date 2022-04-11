import { JobManager } from "../../../utils/server/job-manager.js";
import { CheckFeatureSecurity } from "/imports/utils/security/checkUserPermissionsForFeatures";
import { CheckShipmentSecurity } from "/imports/utils/security/checkUserPermissionForShipment";

import { shipmentCopy } from "./shipment-copy";

export const copyShipment = ({ accountId, userId }) => ({
  accountId,
  userId,
  async runChecks() {
    const featureCheck = new CheckFeatureSecurity({}, { accountId, userId });
    await featureCheck.getDoc();
    featureCheck.can({ feature: "shipment" }).throw();
    const roleCheck = new CheckShipmentSecurity({}, { accountId, userId });
    await roleCheck.getUserRoles();
    roleCheck.can({ action: "createShipment" }).throw();
    return this;
  },
  async makeCopy({ shipmentId, options }) {
    const srv = shipmentCopy({ accountId, userId });
    await srv.init({ shipmentId, options });
    await srv.copyShipment();

    await srv.copyItems();
    await srv.copyStages();
    await srv.updateShipment();
    await srv.updateReferencingDocs();
    this.newShipmentId = srv.getId();
    return this;
  },
  notifications() {
    return JobManager.post("shipment.created", {
      userId: this.userId,
      accountId: this.accountId,
      shipmentId: this.newShipmentId
    });
  },
  get() {
    return this.newShipmentId;
  }
});
