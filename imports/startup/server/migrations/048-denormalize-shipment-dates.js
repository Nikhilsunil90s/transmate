/* global Migrations */
import { Shipment } from "/imports/api/shipments/Shipment";

Migrations.add({
  version: 48,
  name: "De-normalize shipment dates",
  up: async () => {
    const shipments = await Shipment._collection.aggregate([
      { $match: { "from.datePlanned": { $exists: false } } },
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

      // only where planned || actual is set:
      {
        $match: {
          $or: [
            { "firstStage.dates.pickup.arrival.planned": { $exists: true } },
            { "firstStage.dates.pickup.arrival.actual": { $exists: true } },
            { "lastStage.dates.delivery.arrival.planned": { $exists: true } },
            { "lastStage.dates.delivery.arrival.planned": { $exists: true } }
          ]
        }
      },
      {
        $project: {
          "updates.pickupDatePlanned":
            "$firstStage.dates.pickup.arrival.planned",
          "updates.pickupDateActual": "$firstStage.dates.pickup.arrival.actual",
          "updates.deliveryDatePlanned":
            "$lastStage.dates.delivery.arrival.planned",
          "updates.deliveryDateActual":
            "$lastStage.dates.delivery.arrival.actual"
        }
      }
    ]);

    // update shipment based on stage data
    const bulkOp = Shipment._collection
      .rawCollection()
      .initializeUnorderedBulkOp();

    shipments.forEach(({ _id, updates }) => {
      const $set = {
        ...(updates.pickupDatePlanned
          ? { "pickup.datePlanned": updates.pickupDatePlanned }
          : {}),
        ...(updates.pickupDateActual
          ? { "pickup.dateActual": updates.pickupDateActual }
          : {}),
        ...(updates.deliveryDatePlanned
          ? { "delivery.datePlanned": updates.deliveryDatePlanned }
          : {}),
        ...(updates.deliveryDateActual
          ? { "pickup.dateActual": updates.deliveryDateActual }
          : {})
      };
      if (Object.keys($set).length > 0) {
        bulkOp.find({ _id }).updateOne({ $set });
      }
    });
    try {
      await bulkOp.execute();
    } catch (error) {
      console.error(error);
    }
  }
});

// script to run it separately in no-sql booster:
/*
const shipments = db.shipments.aggregate([
    { $match: { "from.datePlanned": { $exists: false }}},
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

    // only where planned || actual is set:
    {
        $match: {
            $or: [
                { "firstStage.dates.pickup.arrival.planned": { $exists: true } },
                { "firstStage.dates.pickup.arrival.actual": { $exists: true } },
                { "lastStage.dates.delivery.arrival.planned": { $exists: true } },
                { "lastStage.dates.delivery.arrival.planned": { $exists: true } }
            ]
        }
    },
    {
        $project: {
            "updates.pickupDatePlanned": "$firstStage.dates.pickup.arrival.planned",
            "updates.pickupDateActual": "$firstStage.dates.pickup.arrival.actual",
            "updates.deliveryDatePlanned": "$lastStage.dates.delivery.arrival.planned",
            "updates.deliveryDateActual": "$lastStage.dates.delivery.arrival.actual"
        }
    }
]).toArray();

if (shipments.length > 0) {

// update shipment based on stage data
const bulkOp = db.shipments.initializeUnorderedBulkOp();

shipments.forEach(({ _id, updates }) => {
    bulkOp.find({ _id }).updateOne({
        $set: {
            ...(updates.pickupDatePlanned
                ? { "pickup.datePlanned": updates.pickupDatePlanned }
                : {}),
            ...(updates.pickupDateActual
                ? { "pickup.dateActual": updates.pickupDateActual }
                : {}),
            ...(updates.deliveryDatePlanned
                ? { "delivery.datePlanned": updates.deliveryDatePlanned }
                : {}),
            ...(updates.deliveryDateActual
                ? { "pickup.dateActual": updates.deliveryDateActual }
                : {})
        }
    });
});

bulkOp.execute();
}
*/
