import { ShipmentItem } from "/imports/api/items/ShipmentItem";
import {
  changeShipmentItemParentNode,
  changeNodeChildrenLevel
} from "/imports/api/items/items-helper";
import { shipmentAggregation } from "/imports/api/shipments/services/query.pipelineBuilder";

const debug = require("debug")("apollo:resolver:item");

export const changeParentNode = ({ accountId, userId }) => ({
  accountId,
  userId,
  context: { accountId, userId },
  async runChecks({ shipmentId }) {
    this.shipmentId = shipmentId;

    return this;
  },
  async changeNode({ id, targetParentItemId }) {
    const node = await ShipmentItem.first(id);
    const preLevel = node.level;
    const targetParent = targetParentItemId
      ? await ShipmentItem.first(targetParentItemId)
      : null;
    const data = await ShipmentItem.where({ shipmentId: this.shipmentId });

    const [newDataArr, updatedNodeIds] = changeShipmentItemParentNode({
      data,
      node,
      targetParent
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
      return false;
    }

    // :update its and children level
    const newLevel = targetParent ? targetParent.level + 1 : 0;
    const levelChange = newLevel - preLevel;

    // update self
    await node.save_async({ level: newLevel });
    const updatedChildrenIds = changeNodeChildrenLevel({
      data,
      nodeId: id,
      change: levelChange
    });
    debug("updatedChildrenIds update", updatedChildrenIds, levelChange);
    await Promise.all(
      updatedChildrenIds.map(async uid => {
        const item = data.find(it => it.id === uid);

        debug("updatedChildrenIds update", uid, item.level);
        await item.save_async({ level: item.level });
        return null;
      })
    );
    return this;
  },
  async getUIResponse() {
    const srv = shipmentAggregation({ accountId, userId });
    await srv.getUserEntities();
    srv
      .matchId({ shipmentId: this.shipmentId })
      .match({
        options: { noStatusFilter: true },
        fieldsProjection: {}
      })
      .getItems({});

    const res = await srv.fetchDirect();
    return res[0] || {};
  }
});
