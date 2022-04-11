import { ShipmentItem } from "/imports/api/items/ShipmentItem";
import SecurityChecks from "/imports/utils/security/_security.js";

import {
  changeShipmentItemParentNode,
  changeNodeChildrenLevel
} from "/imports/api/items/items-helper";

const debug = require("debug")("apollo:resolver:item");

export const changeShipmentItemParent = ({ accountId, userId }) => ({
  accountId,
  userId,
  async init({ shipmentId, id, targetParentItemId }) {
    this.shipmentItemId = id;
    this.node = await ShipmentItem.first(id);
    SecurityChecks.checkIfExists(this.node);

    this.preLevel = this.node.level;
    this.targetParent = targetParentItemId
      ? await ShipmentItem.first(targetParentItemId)
      : null;
    this.data = await ShipmentItem.where({ shipmentId });

    if (!this.data || this.data.length === 0)
      throw new Error("No items to move");
    return this;
  },

  async changeParentNode() {
    const [newDataArr, updatedNodeIds] = changeShipmentItemParentNode({
      data: this.data, // all items that can be moved (filtered in the fn)
      node: this.node,
      targetParent: this.targetParent
    });

    try {
      await Promise.all(
        updatedNodeIds.map(async uid => {
          const item = newDataArr.find(it => it.id === uid);

          // debug("uid", uid, item);
          await item.save_async({
            parentItemId: item.parentItemId,
            weight_net: item.weight_net,
            weight_gross: item.weight_gross
          });
          return null;
        })
      );
    } catch (err) {
      console.error(`changeShipmentItemParentNode:error`, err);
      return this;
    }

    // :update its and children level
    const newLevel = this.targetParent ? this.targetParent.level + 1 : 0;
    const levelChange = newLevel - this.preLevel;

    // update self
    await this.node.save_async({
      level: newLevel
    });
    const updatedChildrenIds = changeNodeChildrenLevel({
      data: this.data,
      nodeId: this.shipmentItemId,
      change: levelChange
    });
    debug("updatedChildrenIds update", updatedChildrenIds, levelChange);
    await Promise.all(
      updatedChildrenIds.map(async uid => {
        const item = this.data.find(it => it.id === uid);

        debug("updatedChildrenIds update", uid, item.level);
        await item.save_async({
          level: item.level
        });
        return null;
      })
    );
    return this;
  },
  getUIResponse() {
    return true;
  }
});
