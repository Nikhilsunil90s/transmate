/* global Migrations */
import { Shipment } from "/imports/api/shipments/Shipment";
import { toTitleCase } from "/imports/utils/functions/fnStringToTitleCase";
import { Random } from "/imports/utils/functions/random";

Migrations.add({
  version: 59,
  name: "reset shipment costs - parcels",
  // eslint-disable-next-line consistent-return
  up: async () => {
    const shipmentsWithCosts = Shipment._collection.aggregate([
      {
        $match: {
          type: "parcel",
          deleted: false,
          pickingStatus: "printed",
          costs: { $exists: false }
        }
      },
      { $project: { _id: 1 } },
      {
        $lookup: {
          from: "shipment.items",
          let: { shipmentId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$shipmentId", "$$shipmentId"] },
                    { $eq: ["$isPackingUnit", true] }
                  ]
                }
              }
            }
          ],
          as: "items"
        }
      },
      { $unwind: "$items" },
      { $unwind: "$items.edi.label.costs" },
      {
        $addFields: {
          "items.edi.label.costs.meta.packingItemIds": ["$items._id"],
          "items.edi.label.costs.accountId": "$accountId",
          "items.edi.label.costs.sellerId": "$items.edi.label.carrierId",
          date: new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            new Date().getDate()
          )
        }
      },
      {
        $group: {
          _id: "$_id",
          costs: {
            $push: "$items.edi.label.costs"
          }
        }
      }
    ]);

    const bulkOp = Shipment._collection
      .rawCollection()
      .initializeOrderedBulkOp();

    shipmentsWithCosts.forEach(({ _id: shipmentId, costs = [] }) => {
      bulkOp.find({ _id: shipmentId }).updateOne({
        $set: {
          costs: costs.map(costItem => ({
            ...costItem,
            id: Random.id(6),
            description: toTitleCase(costItem.description),
            added: {
              by: "migrationScript",
              at: new Date()
            }
          })),
          updated: { by: "migrationScript", at: new Date() }
        }
      });
    });
    if (shipmentsWithCosts.length) {
      try {
        await bulkOp.execute();
      } catch (e) {
        console.error(e);
      }
    }
    return true;
  }
});

// noSql script:
/*
const Shipment = db["shipments"];

Shipment.aggregate([
    { $match: { type: "parcel", deleted: false, pickingStatus: "printed", costs: { $exists: false } } },
    { $project: { _id: 1, accountId: 1 } },
    {
        $lookup: {
            from: "shipment.items",
            let: { shipmentId: "$_id" },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: ["$shipmentId", "$$shipmentId"] },
                                { $eq: ["$isPackingUnit", true] }
                            ]
                        }
                    }
                }]
            , as: 'items'
        }
    },
    // {$limit : 5 },
    { $unwind: "$items" },
    { $unwind: "$items.edi.label.costs" },
    {
        $addFields: {
            "items.edi.label.costs.meta.packingItemIds": ["$items._id"],
            "items.edi.label.costs.accountId": '$accountId',
            "items.edi.label.costs.sellerId": "$items.edi.label.carrierId",
            date: new Date(
                new Date().getFullYear(),
                new Date().getMonth(),
                new Date().getDate()
            )


        }
    },
    {
        $group: {
            _id: "$_id",
            costs: {
                $push: "$items.edi.label.costs"
            }
        }
    }
]);
*/
