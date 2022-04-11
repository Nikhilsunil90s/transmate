/* global Migrations */
import { Shipment } from "/imports/api/shipments/Shipment";

Migrations.add({
  version: 56,
  name: "De-normalize shipment dates",
  up: async () => {
    let count = 0;
    const shipments = await Shipment._collection.aggregate([
      {
        $match: {
          $or: [
            { "from.dateActual": { $exists: false } },
            { "from.dateScheduled": { $exists: false } }
          ]
        }
      },
      { $project: { _id: 1 } },
      {
        $lookup: {
          from: "stages",
          let: { shipmentId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$shipmentId", "$$shipmentId"] } } },
            { $project: { dates: 1, sequence: 1 } },
            { $sort: { sequence: 1 } }
          ],
          as: "stages"
        }
      },
      {
        $addFields: {
          firstStage: { $arrayElemAt: ["$stages", 0] },
          lastStage: { $arrayElemAt: ["$stages", -1] }
        }
      },

      // only where scheduled || actual is set:
      {
        $match: {
          $or: [
            { "firstStage.dates.pickup.arrival.actual": { $exists: true } },
            { "firstStage.dates.pickup.arrival.scheduled": { $exists: true } },
            { "lastStage.dates.delivery.arrival.actual": { $exists: true } },
            { "lastStage.dates.delivery.arrival.scheduled": { $exists: true } }
          ]
        }
      },
      {
        $project: {
          pickupDateActual: "$firstStage.dates.pickup.arrival.actual",
          pickupDateScheduled: "$firstStage.dates.pickup.arrival.scheduled",

          deliveryDateActual: "$lastStage.dates.delivery.arrival.actual",
          deliveryDateScheduled: "$lastStage.dates.delivery.arrival.scheduled"
        }
      }
    ]);

    // update shipment based on stage data
    const bulkOp = Shipment._collection
      .rawCollection()
      .initializeUnorderedBulkOp();

    shipments.forEach(({ _id, ...updates }) => {
      const $set = {
        ...(updates.pickupDateActual
          ? { "pickup.dateActual": updates.pickupDateActual }
          : {}),
        ...(updates.pickupDateScheduled
          ? { "pickup.dateScheduled": updates.pickupDateScheduled }
          : {}),
        ...(updates.deliveryDateActual
          ? { "delivery.dateActual": updates.deliveryDateActual }
          : {}),
        ...(updates.deliveryDateScheduled
          ? { "delivery.dateScheduled": updates.deliveryDateScheduled }
          : {})
      };
      if (Object.keys($set).length > 0) {
        count += 1;
        bulkOp.find({ _id }).updateOne({ $set });
      }
    });
    if (count > 0) bulkOp.executeAsync();
  }
});

// script to run it separately in no-sql booster:
/*
const shipments = db.shipments.aggregate([
    {
        $match: {
          $or: [
            { "from.dateActual": { $exists: false } },
            { "from.dateScheduled": { $exists: false } }
          ]
        }
      },
      { $project: { _id: 1 } },
      {
        $lookup: {
          from: "stages",
          let: { shipmentId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$shipmentId", "$$shipmentId"] } } },
            { $project: { dates: 1, sequence: 1 } },
            { $sort: { sequence: 1 } }
          ],
          as: "stages"
        }
      },
      {
        $addFields: {
          firstStage: { $arrayElemAt: ["$stages", 0] },
          lastStage: { $arrayElemAt: ["$stages", -1] }
        }
      },

      // only where scheduled || actual is set:
      {
        $match: {
          $or: [
            { "firstStage.dates.pickup.arrival.actual": { $exists: true } },
            { "firstStage.dates.pickup.arrival.scheduled": { $exists: true } },
            { "lastStage.dates.delivery.arrival.actual": { $exists: true } },
            { "lastStage.dates.delivery.arrival.scheduled": { $exists: true } }
          ]
        }
      },
      {
        $project: {
          "pickupDateActual": "$firstStage.dates.pickup.arrival.actual",
          "pickupDateScheduled": "$firstStage.dates.pickup.arrival.scheduled",

          "deliveryDateActual":"$lastStage.dates.delivery.arrival.actual",
          "deliveryDateScheduled":"$lastStage.dates.delivery.arrival.scheduled"
        }
      }
]).toArray();

if (shipments.length > 0) {

// update shipment based on stage data
const bulkOp = db.shipments.initializeUnorderedBulkOp();

shipments.forEach(({ _id, ...updates }) => {
    
    const $set = {
        ...(updates.pickupDateActual
          ? { "pickup.dateActual": updates.pickupDateActual }
          : {}),
          ...(updates.pickupDateScheduled
            ? { "pickup.dateScheduled": updates.pickupDateScheduled }
            : {}),
        ...(updates.deliveryDateActual
          ? { "delivery.dateActual": updates.deliveryDateActual }
          : {}),
          ...(updates.deliveryDateScheduled
            ? { "delivery.dateScheduled": updates.deliveryDateScheduled }
            : {})
      };
      if (Object.keys($set).length > 0) {
        bulkOp.find({ _id }).updateOne({ $set });
      }
});

bulkOp.execute();
}
*/
