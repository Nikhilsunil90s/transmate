import { Shipment } from "../../shipments/Shipment";
import { ShipmentItem } from "/imports/api/items/ShipmentItem";
import { ITEM_FIELDS } from "./query.getPickingDetail";
import { shipmentAggregation } from "/imports/api/shipments/services/query.pipelineBuilder";

export const packShipmentItems = ({ accountId, userId }) => ({
  accountId,
  userId,
  context: { accountId, userId },
  result: { errors: [], successCount: 0, errorCount: 0 },
  async init({ shipmentId, shipmentItemIds }) {
    this.shipmentItemIds = shipmentItemIds || [];
    this.shipmentId = shipmentId;
    this.shipment = await Shipment.first(shipmentId, {
      fields: { status: 1 }
    });

    // checks:
    // this.checkSrv.can({ action: "addItemToShipment" }).throw();
    return this;
  },

  /**
   * either looks up the shipmentItem if it is given
   * either creates a new shipmentItem
   *
   * stores parentItemId
   * @async
   * @returns {this}
   */
  async initializePackingUnit({ parentItem }) {
    const {
      id: parentItemId,
      code: quantityUnit,
      ...parentItemDetails
    } = parentItem;
    if (!parentItemId && !quantityUnit) throw new Error("no packing unit set");

    if (quantityUnit) {
      // in case the shipmentItemIds itself was child of an item X, we want to squeeze the item in between
      // we also keep the level, in order to keep sequence correct
      const {
        level,
        parentItemId: childPreviousParentItemId
      } = await ShipmentItem.first(
        { _id: { $in: this.shipmentItemIds } },
        { fields: { parentItemId: 1, level: 1 } }
      );

      const updateObj = {
        level: level + 1,
        shipmentId: this.shipmentId,
        parentItemId: childPreviousParentItemId,
        type: "HU",
        isPackingUnit: true,
        quantity: { code: quantityUnit, amount: 1 },
        ...parentItemDetails
      };

      this.parentItem = await ShipmentItem.create_async(updateObj);
      this.parentItemId = this.parentItem.id;
    } else if (parentItemId) {
      this.parentItemId = parentItemId;
      this.parentItem = await ShipmentItem.first({
        _id: parentItemId,
        shipmentId: this.shipmentId
      });
      if (!this.parentItem) throw new Error("Item not found, could not pack");

      // can modify weight and dimensions!
      await this.parentItem.update_async({
        ...parentItemDetails,
        "quantity.code": quantityUnit
      });
    }

    if (!this.parentItemId) throw new Error("Could not initialize parent");
    return this;
  },

  /**
   * adds all subItems to the parentItemId
   * @param {{shipmentItemIds: String[]}} param0
   * @returns {this}
   * @async
   */
  async mountItems() {
    await ShipmentItem._collection.update(
      { _id: { $in: this.shipmentItemIds } },
      {
        $set: {
          parentItemId: this.parentItemId,
          isPicked: true,
          level: this.parentItem.level + 1
        }
      },
      { multi: true }
    );
    this.result.successCount = this.shipmentItemIds.length;
    return this;
  },

  /**
   * removes items from packing unit
   * 1. get parentItem itself -> does this have a parentItemId? & no label??
   * 2. update children: parentItemId of parent, level -1, isPicked: false
   * @param {{packingItemIds: String[]}} param0
   * @returns {this}
   * @async
   */
  async unmountItems({ packingUnitsIds = [] }) {
    const parentItems = await ShipmentItem.where(
      { _id: { $in: packingUnitsIds } },
      {
        fields: {
          shipmentId: 1,
          parentItemId: 1,
          labelUrl: 1,
          isPackingUnit: 1,
          level: 1
        }
      }
    );
    if (parentItems.length === 0) throw new Error("Packing units not found");
    const { shipmentId } = parentItems[0] || {};
    await this.init({ shipmentId });

    await Promise.all(
      parentItems.map(
        async ({ id, parentItemId, isPackingUnit, labelUrl, level }) => {
          if (!isPackingUnit || !!labelUrl) {
            // no valid unmounting operation
            this.result.errors.push(`item ${id} could not be removed`);
            this.result.errorCount += 1;
          }

          await ShipmentItem._collection.update(
            { parentItemId: id },
            {
              $set: {
                parentItemId: parentItemId || null,
                isPicked: false,
                level
              }
            },
            { multi: true }
          );
          this.result.successCount += 1;
          return true;
        }
      )
    );
    await ShipmentItem._collection.remove(
      { _id: { $in: packingUnitsIds } },
      { multi: true }
    );
    return this;
  },
  async updatePickingStatus() {
    const [allToPickCount, notPickedCount] = await Promise.all([
      ShipmentItem.count({
        shipmentId: this.shipmentId,
        type: "HU",
        isPackingUnit: { $ne: true }
      }),
      ShipmentItem.count({
        shipmentId: this.shipmentId,
        type: "HU",
        isPicked: { $ne: true },
        isPackingUnit: { $ne: true }
      })
    ]);

    let pickingStatus = "none";
    if (allToPickCount > 0 && notPickedCount === 0) {
      pickingStatus = "packed";
      await this.shipment.addUpdate("picking", {}, this.context);
    } else if (allToPickCount > 0 && notPickedCount < allToPickCount) {
      pickingStatus = "partial";
    }

    await this.shipment.update_async({ pickingStatus });
    return this;
  },
  async getUIResponse() {
    const srv = shipmentAggregation({
      accountId: this.accountId,
      userId: this.userId
    });
    await srv.getUserEntities();
    const arr = await srv
      .matchId({ shipmentId: this.shipmentId })
      .match({ fieldsProjection: { status: 1, pickingStatus: 1 } })
      .getItems({ depth: 4, fields: ITEM_FIELDS, types: ["HU"] })
      .fetchDirect();
    return arr[0];
  }
});
