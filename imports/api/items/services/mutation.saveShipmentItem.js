import SecurityChecks from "/imports/utils/security/_security.js";
import { ShipmentItem } from "/imports/api/items/ShipmentItem";
import { Shipment } from "/imports/api/shipments/Shipment";
import { shipmentAggregation } from "/imports/api/shipments/services/query.pipelineBuilder";

import {
  CheckItemSecurity,
  requiredShipmentFields
} from "/imports/utils/security/checkUserPermissionsForShipmentItem";

export const saveShipmentItem = ({ accountId, userId }) => ({
  accountId,
  userId,
  context: { accountId, userId },
  async runChecks({ shipmentId }) {
    this.shipmentId = shipmentId;
    this.shipment = await Shipment.first(shipmentId, {
      fields: requiredShipmentFields
    });
    SecurityChecks.checkIfExists(this.shipment);
    this.checkSrv = new CheckItemSecurity(
      {
        shipment: this.shipment
      },
      {
        accountId: this.accountId,
        userId: this.userId
      }
    );
    await this.checkSrv.getUserRoles();
    return this;
  },
  async upsert({ id, update }) {
    if (id) {
      this.id = id;

      // TODO [#327]: find a way to allow reference updates from stakeholders
      // if field is reference, it should be updated if not owner
      // other fields -> only owner
      // this.checkSrv.can({ action: "updateItemInShipment" }).throw();

      // update
      const item = await ShipmentItem.first(id);
      await item.update_async(update);

      await this.shipment.addUpdate(
        "items",
        { id: this.id, event: "update" },
        this.context
      );
    } else {
      this.checkSrv.can({ action: "addItemToShipment" }).throw();
      const updateObj = {
        level: 0,
        shipmentId: this.shipmentId,
        ...update
      };

      const created = await ShipmentItem.create_async(updateObj);
      this.newId = created.id;
      await this.shipment.addUpdate(
        "items",
        { id: this.newId, event: "add" },
        this.context
      );
    }
    return this;
  },
  async getUIResonse() {
    const srv = shipmentAggregation({ accountId, userId })
      .matchId({ shipmentId: this.shipmentId })
      .match({
        options: { noStatusFilter: true, noAccountFilter: true },
        fieldsProjection: {}
      })
      .getItems({});

    const res = await srv.fetchDirect();
    return res[0] || {};
  }
});
