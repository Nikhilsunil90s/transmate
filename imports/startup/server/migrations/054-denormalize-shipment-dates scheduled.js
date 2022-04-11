/* global Migrations */
import { Shipment } from "/imports/api/shipments/Shipment";

Migrations.add({
  version: 54,
  name: "De-normalize shipment dates - scheduled date",
  up: async () => {
    let runOperation;
    const shipments = await Shipment._collection.aggregate([
      { $match: { "from.dateScheduled": { $exists: false } } },
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
            { "firstStage.dates.pickup.arrival.scheduled": { $exists: true } },
            { "lastStage.dates.delivery.arrival.scheduled": { $exists: true } }
          ]
        }
      },
      {
        $project: {
          "updates.pickupDateScheduled":
            "$firstStage.dates.pickup.arrival.scheduled",
          "updates.deliveryDateScheduled":
            "$lastStage.dates.delivery.arrival.scheduled"
        }
      }
    ]);

    // update shipment based on stage data
    const bulkOp = Shipment._collection
      .rawCollection()
      .initializeUnorderedBulkOp();

    shipments.forEach(({ _id, updates }) => {
      const $set = {
        ...(updates.pickupDateScheduled
          ? { "pickup.dateScheduled": updates.pickupDateScheduled }
          : {}),
        ...(updates.deliveryDatePlanned
          ? { "delivery.dateScheduled": updates.deliveryDateScheduled }
          : {})
      };
      if (Object.keys($set).length > 0) {
        runOperation = true;
        bulkOp.find({ _id }).updateOne({ $set });
      }
    });
    try {
      if (runOperation) {
        await bulkOp.execute();
      }
    } catch (error) {
      console.error(error);
    }
  }
});
