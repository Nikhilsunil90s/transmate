import { ShipmentItem } from "../../items/ShipmentItem";
import { Shipment } from "../../shipments/Shipment";
import { Stage } from "/imports/api/stages/Stage";

import { shipmentAggregation } from "/imports/api/shipments/services/query.pipelineBuilder";
import { generateUniqueId } from "/imports/utils/functions/fnGenerateRandomIdNotInList";

const ITEM_FIELDS = {
  type: 1,
  parentItemId: 1,
  quantity: 1,
  description: 1,
  references: 1,
  isPackingUnit: 1,
  labelUrl: 1,
  shipmentId: 1
};

const SHIPMENT_FIELDS = { carrierIds: 1, pickingStatus: 1, status: 1 };
const SHIPMENT_FIELDS_RESPONSE = {
  number: 1,
  accountId: 1,
  carrierIds: 1,
  type: 1,
  status: 1,
  references: 1,
  pickup: 1,
  delivery: 1,
  pickingStatus: 1
};

/**
 * will generate the manifest for all shipments that are being sent.
 * Flags the shipmentPicking status as "printed"
 * will return the document to the client
 * shipments need to be FULLY picked
 * @param {*} param0
 * @returns
 */
export const printPickingManifest = ({ accountId, userId }) => ({
  accountId,
  userId,
  async init({ shipmentIds = [] }) {
    this.shipmentIds = shipmentIds;
    this.shipments = await Shipment.where(
      { _id: { $in: this.shipmentIds } },
      { fields: SHIPMENT_FIELDS }
    );

    if (shipmentIds.length !== this.shipments.length)
      throw new Error("Not all shipments are found");
    this.packingUnitItems = await ShipmentItem.where(
      {
        shipmentId: { $in: this.shipmentIds },
        isPackingUnit: true
      },
      { fields: ITEM_FIELDS }
    );
    if (
      !this.packingUnitItems.every(item => item.isPackingUnit && item.labelUrl)
    )
      throw new Error("Not all packing unit items have labels");

    return this;
  },

  /**
   * @method setShipmentStart
   * confirm stages & fix the carrier
   * will update shipment status
   * will modify shipment stage to started
   * will place timestamp of actual shipping
   * shipments need to be FULLY picked
   */
  async setShipmentStart() {
    const operations = [];
    this.shipments.forEach(({ id, carrierIds }) => {
      const usedIds = [];

      // 1. calculate costs:
      const costs = this.packingUnitItems.reduce((acc, cur) => {
        if (cur.shipmentId === id) {
          const generatedId = generateUniqueId(6, usedIds);
          usedIds.push(generatedId);
          (cur.edi?.label?.charges || []).forEach(curCost => {
            acc.push({
              ...curCost,
              id: generatedId,
              accountId: this.accountId,
              sellerId: carrierIds[0],
              forApproval: false
            });
          });
        }
        return acc;
      }, []);

      operations.push(
        Shipment._collection.update(
          { _id: id },
          {
            $set: {
              costs,
              status: "started",
              "pickup.dateActual": new Date()

              // "pickup.datePlanned": "", // cutoff date
              // "delivery.datePlanned": ""
            }
          }
        )
      );
      operations.push(
        Stage._collection.update(
          { shipmentId: id },
          {
            $set: {
              status: "started",
              "dates.pickup.arrival.actual": new Date()
            }
          }
        )
      );
    });

    if (operations.length) {
      await Promise.all(operations);
    }
    return this;
  },

  // the result will be used for printing out a document
  // the result are all shipments with their items, this will be rendered in a table and printed
  async getUIResponse() {
    const srv = shipmentAggregation({ accountId, userId });
    await srv.getUserEntities();
    return srv
      .match({
        fieldsProjection: SHIPMENT_FIELDS_RESPONSE,
        query: [{ _id: { $in: this.shipmentIds } }]
      })
      .getAccountData({ partner: "carrier" })
      .getItems({ depth: 2, fields: ITEM_FIELDS, types: ["HU"] })
      .fetchDirect();
  }
});
