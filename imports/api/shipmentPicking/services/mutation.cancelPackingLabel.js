import get from "lodash.get";
import { ShipmentItem } from "/imports/api/items/ShipmentItem";
import { Shipment } from "/imports/api/shipments/Shipment";
import { Stage } from "/imports/api/stages/Stage";
import { shipmentAggregation } from "/imports/api/shipments/services/query.pipelineBuilder";
import { ITEM_FIELDS } from "./query.getPickingDetail";

/**
 * will send the cancelation to the remote api
 * will modify the picking status
 * @name cancelPackingLabel
 * @param {{accountId: string, userId: string}} param0
 * @returns {this}
 */
export const cancelPackingLabel = ({ accountId, userId }) => ({
  accountId,
  userId,

  /** initialize with either shipmentId or with array of packing unit ids
   * @param {{packingItemIds?: string[], shipmentId?: string}} param0
   */
  async init({ packingItemIds, shipmentId }) {
    if (shipmentId) {
      this.shipmentId = shipmentId;
      this.items = await ShipmentItem.where({
        shipmentId,
        isPackingUnit: true
      });
      this.itemIds = this.items.map(({ id }) => id);
    } else if (packingItemIds && packingItemIds.length) {
      this.itemIds = packingItemIds;
      this.items = await ShipmentItem.where({ _id: { $in: packingItemIds } });
      if (this.items.length && this.items[0].shipmentId) {
        this.shipmentId = this.items[0].shipmentId;
        this.carrierId = this.items[0].edi?.label?.carrierId;
      } else {
        throw new Error("Item not found, could not cancel");
      }
    } else {
      throw new Error(
        "Pass in packing item ids or shipment id to cancel labels"
      );
    }

    this.shipment = await Shipment.first(this.shipmentId);
    if (!this.shipment) throw new Error("Item shipment not found");
    return this;
  },
  async cancelLabel() {
    // const { edi } = this.item;

    // for direct we do not need to cancel remotely
    // IS THIS STILL REQUIRED??
    // if (!["DHL-direct"].includes(edi?.operationType)) {
    //   if (!get(edi, ["label", "object_id"]))
    //     throw new Error("Could not cancel label");
    //   await callCloudFunction("cancelordeletelabel", {
    //     transaction: edi.label.object_id
    //   });
    // }

    this.canceledTrackingNumbers = this.items.map(doc =>
      get(doc, ["references", "trackingNumber"])
    );

    await ShipmentItem._collection.update(
      { _id: { $in: this.itemIds } },
      { $unset: { labelUrl: 1, "references.trackingNumber": 1 } }
    );
    return this;
  },
  async setShipmentAllocation() {
    // if no labels -> make sure the carrier is pulled
    // pickingStatus should be "packed"

    const packingUnitsWithLabel = await ShipmentItem.count({
      shipmentId: this.shipmentId,
      type: "HU",
      isPackingUnit: true,
      labelUrl: { $exists: true }
    });
    const hasNoPrintedPackingUnits = packingUnitsWithLabel === 0;

    await Promise.all([
      Shipment._collection.update(
        { _id: this.shipmentId },
        {
          $set: {
            pickingStatus: "packed"
          },
          $pull: {
            ...(hasNoPrintedPackingUnits ? { carrierIds: this.carrierId } : {}),
            costs: {
              "meta.packingItemIds": { $in: this.itemIds }
            }
          },
          $pullAll: { trackingNumbers: this.canceledTrackingNumbers }
        }
      ),
      ...(hasNoPrintedPackingUnits
        ? [
            Stage._collection.update(
              { shipmentId: this.shipmentId },
              { $set: { mode: "parcel" }, $unset: { carrierId: 1 } }
            )
          ]
        : [])
    ]);

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
      .match({
        fieldsProjection: { status: 1, pickingStatus: 1, trackingNumbers: 1 }
      })
      .getItems({ depth: 4, fields: ITEM_FIELDS, types: ["HU"] })
      .fetchDirect();
    return arr[0];
  }
});
