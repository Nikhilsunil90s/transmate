/* eslint-disable no-await-in-loop */
import SecurityChecks from "/imports/utils/security/_security.js";
import { ShipmentItem } from "/imports/api/items/ShipmentItem";
import { Shipment } from "/imports/api/shipments/Shipment";

import {
  CheckItemSecurity,
  requiredShipmentFields
} from "/imports/utils/security/checkUserPermissionsForShipmentItem";
import { shipmentAggregation } from "/imports/api/shipments/services/query.pipelineBuilder";

function setAmounts(original, newAmount) {
  const orgAmount = original.quantity?.amount;
  const fraction = newAmount / orgAmount;
  const weightNet = original.weight_net * fraction;
  return {
    quantity: { ...original.quantity, amount: newAmount },
    weight_net: weightNet,
    weight_gross: original.weight_tare
      ? weightNet + original.weight_tare
      : original.weight_gross * fraction,
    taxable: (original.taxable || []).map(({ quantity, ...rest }) => ({
      ...rest,
      quantity: quantity * fraction
    }))
  };
}

export const splitShipmentItem = ({ accountId, userId }) => ({
  accountId,
  userId,
  context: { accountId, userId },
  async init({ shipmentItemId, amount }) {
    this.itemId = shipmentItemId;
    this.item = await ShipmentItem.first(shipmentItemId);
    SecurityChecks.checkIfExists(this.item);

    if (amount > this.item.quantity?.amount)
      throw new Error("Amount is larger than original amount");
    this.amount = amount;

    this.shipmentId = this.item.shipmentId;
    this.shipment = await Shipment.first(this.shipmentId, {
      fields: requiredShipmentFields
    });
    SecurityChecks.checkIfExists(this.shipment);

    const check = new CheckItemSecurity(
      {
        shipment: this.shipment
      },
      {
        accountId: this.accountId,
        userId: this.userId
      }
    );
    await check.getUserRoles();
    check.can({ action: "updateItemInShipment" }).throw();
    return this;
  },
  async split() {
    const remainderAmount = this.item.quantity?.amount - this.amount;

    // eslint-disable-next-line camelcase
    const { id, _id, __is_new, ...newItemProps } = this.item;

    await ShipmentItem.create_async({
      ...newItemProps,
      ...setAmounts(newItemProps, remainderAmount)
    });
    await this.item.update_async({ ...setAmounts(this.item, this.amount) });

    return this;
  },
  async getUIResponse() {
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
