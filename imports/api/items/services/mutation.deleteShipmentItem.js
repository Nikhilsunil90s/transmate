/* eslint-disable no-await-in-loop */
import SecurityChecks from "/imports/utils/security/_security.js";
import { ShipmentItem } from "/imports/api/items/ShipmentItem";
import { Shipment } from "/imports/api/shipments/Shipment";

import {
  caculateShipmentItemHierarchy,
  caculateShipmentItem
} from "../items-helper";

import {
  CheckItemSecurity,
  requiredShipmentFields
} from "/imports/utils/security/checkUserPermissionsForShipmentItem";
import { shipmentAggregation } from "/imports/api/shipments/services/query.pipelineBuilder";

const debug = require("debug")("apollo:resolver:item");

const MAX_ITER = 10;

export const deleteShipmentItem = ({ accountId, userId }) => ({
  accountId,
  userId,
  context: { accountId, userId },
  async runChecks({ id }) {
    this.itemId = id;
    this.item = await ShipmentItem.first(id);
    SecurityChecks.checkIfExists(this.item);

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
  async delete() {
    await this.item.destroy_async();
    this.shipment.addUpdate(
      "items",
      { id: this.itemId, event: "delete" },
      this.context
    );

    // all children should level up
    let parentItemIds = [this.itemId];
    let i = 0;
    do {
      const childrenIds = (
        await ShipmentItem.where(
          { parentItemId: { $in: parentItemIds } },
          { fields: { _id: 1 } }
        )
      ).map(({ id }) => id);
      await ShipmentItem._collection.update(
        { _id: { $in: childrenIds } },
        {
          $inc: { level: -1 },

          // remove parentItemId for first child level
          ...(i === 0 ? { $unset: { parentItemId: 1 } } : {})
        }
      );
      parentItemIds = childrenIds;
      i += 1;
    } while (parentItemIds.lenght > 0 && i < MAX_ITER);

    if (this.item.parentItemId) {
      // :substract the parent weight?
      try {
        const data = await ShipmentItem.where({ shipmentId: this.shipmentId });
        const change = -this.item.weight_gross;
        const parentNode = data.find(
          ({ id: iid }) => iid === this.item.parentItemId
        );

        const updatedNodeIds = caculateShipmentItemHierarchy(
          parentNode,
          change,
          data
        );
        caculateShipmentItem(parentNode, change);
        updatedNodeIds.push(parentNode.id);
        await Promise.all(
          updatedNodeIds.map(async uid => {
            const iitem = data.find(it => it.id === uid);
            debug("uid", uid, iitem);
            await iitem.save_async({
              weight_net: iitem.weight_net,
              weight_gross: iitem.weight_gross
            });
            return null;
          })
        );
      } catch (err) {
        console.error(`deleteShipmentItem:error`, err);
        return false;
      }
    }

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
