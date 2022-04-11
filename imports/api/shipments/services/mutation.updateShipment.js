import { JobManager } from "../../../utils/server/job-manager.js";
import { shipmentAggregation } from "/imports/api/shipments/services/query.pipelineBuilder";
import { Shipment } from "/imports/api/shipments/Shipment";
import { projectFields } from "/imports/utils/functions/pipelineHelpers/fnProjectFields";

import {
  CheckShipmentSecurity,
  requiredDbFields
} from "/imports/utils/security/checkUserPermissionForShipment";
import SecurityChecks from "/imports/utils/security/_security";

export const updateShipment = ({ accountId, userId }) => ({
  accountId,
  userId,
  async init({ shipmentId }) {
    this.shipmentId = shipmentId;
    this.shipment = await Shipment.first(shipmentId, {
      fields: { ...requiredDbFields, references: 1 }
    });
    SecurityChecks.checkIfExists(this.shipment);

    const check = new CheckShipmentSecurity(
      {
        shipment: this.shipment
      },
      { accountId, userId }
    );
    await check.getUserRoles();

    // FIXME: make granular checks for fields + status
    check.can({ action: "updateShipment" }).throw();

    return this;
  },

  // FIXME: add test (triggered by the update)
  async handleshipmentReferenceUpdate(newReferences) {
    const oldReferenceKeys = Object.keys(this.shipment.references || {});

    const modifiedKeys = Object.keys(newReferences).filter(
      x => !oldReferenceKeys.includes(x)
    );
    return Promise.all(
      modifiedKeys.map(modifiedKey =>
        JobManager.post("shipment.reference", this.shipmentId, {
          reference: modifiedKey,
          userId: this.userId,
          acountId: this.accountId
        })
      )
    );
  },

  async update({ updates }) {
    this.keys = Object.keys(updates);
    if (this.keys.includes("references"))
      this.handleshipmentReferenceUpdate(updates.references);
    await this.shipment.update_async({ ...updates });
    return this;
  },
  async getClientResponse() {
    const srv = shipmentAggregation({
      accountId: this.accountId,
      userId: this.userId
    });
    await srv.getUserEntities();
    srv.matchId({ shipmentId: this.shipmentId });
    srv
      .match({
        fieldsProjection: {
          carrierIds: 1,
          status: 1,
          ...projectFields(this.keys)
        }
      })
      .getAccountData({ partner: "carrier" });

    const res = await srv.fetchDirect();

    return res[0] || {};
  }
});
