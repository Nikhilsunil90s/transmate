import { shipmentAggregation } from "/imports/api/shipments/services/query.pipelineBuilder";
import { Shipment } from "/imports/api/shipments/Shipment";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";

import {
  CheckShipmentSecurity,
  requiredDbFields
} from "/imports/utils/security/checkUserPermissionForShipment";
import SecurityChecks from "/imports/utils/security/_security";
import { setShipmentNotificationFlags } from "../../notifications/helpers/setShipmentNotificationFlags";

export const updatePartners = ({ accountId, userId }) => ({
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
    check.can({ action: "editPartners" }).throw();

    return this;
  },
  async update({ partner, remove }) {
    const updates = {};
    const { partnerId, role } = partner;
    const notificationSrv = setShipmentNotificationFlags({
      shipmentId: this.shipmentId
    });

    if (remove) {
      if (role === "consignee") updates.consigneeId = null;
      if (role === "provider") {
        updates.providerIds = (this.shipment.providerIds || []).filter(
          el => el !== partnerId
        );
      }
      notificationSrv.removeNotificationsForAccounts([partnerId]);
    } else {
      const accountType = AllAccounts.getType(partnerId);
      if (accountType === "provider") updates.providerIds = [partnerId];
      else if (accountType === "shipper") {
        if (role === "consignee") updates.consigneeId = partnerId;
        else if (role === "shipper") updates.shipperId = partnerId;
      }
      notificationSrv.setAfterPartnerUpdate(partnerId, role);
    }

    await this.shipment.update_async(updates);
    this.shipment.addUpdate(
      "partners",
      { event: remove ? "remove" : "add", role, partnerId },
      { userId, accountId }
    );

    return this;
  },
  async getUIResponse() {
    const srv = shipmentAggregation({ accountId: this.accountId });
    srv.matchId({ shipmentId: this.shipmentId });
    srv
      .match({
        options: { noAccountFilter: true },
        fieldsProjection: {
          id: "$_id",
          shipperId: 1,
          carrierIds: 1,
          consigneeId: 1,
          providerIds: 1,
          status: 1
        }
      })
      .getAccountData({ partner: "carrier" })
      .getAccountData({ partner: "shipper" })
      .getAccountData({ partner: "consignee" });

    const res = await srv.fetchDirect();

    return res[0] || {};
  }
});
