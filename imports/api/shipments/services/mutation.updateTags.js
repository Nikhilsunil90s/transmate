import { shipmentAggregation } from "/imports/api/shipments/services/query.pipelineBuilder";
import { Shipment } from "/imports/api/shipments/Shipment";
import { projectFields } from "/imports/utils/functions/pipelineHelpers/fnProjectFields";

import {
  CheckShipmentSecurity,
  requiredDbFields
} from "/imports/utils/security/checkUserPermissionForShipment";
import SecurityChecks from "/imports/utils/security/_security";

export const updateTags = ({ accountId, userId }) => ({
  accountId,
  userId,
  async init({ shipmentId }) {
    this.shipmentId = shipmentId;
    this.shipment = await Shipment.first(shipmentId, {
      fields: { ...requiredDbFields }
    });
    SecurityChecks.checkIfExists(this.shipment);

    const check = new CheckShipmentSecurity(
      {
        shipment: this.shipment
      },
      { accountId, userId }
    );
    await check.getUserRoles();

    check.can({ action: "updateTags" }).throw();

    return this;
  },
  async update({ tags }) {
    await this.shipment.update_async({ tags: tags || [] });

    this.shipment.addUpdate("tags", { tags }, { userId, accountId });
    return this;
  },
  async getUIResponse() {
    const srv = shipmentAggregation({
      accountId: this.accountId,
      userId: this.userId
    });
    await srv.getUserEntities();
    srv.matchId({ shipmentId: this.shipmentId });
    srv.match({
      fieldsProjection: {
        carrierIds: 1,
        status: 1,
        ...projectFields(["tags", "updates"])
      }
    });

    const res = await srv.fetchDirect();

    return res[0] || {};
  }
});
