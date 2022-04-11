/* global Migrations */
import { ShipmentProject } from "/imports/api/shipmentProject/ShipmentProject";

Migrations.add({
  version: 51,
  name: "Reset inbound and outbound project link",
  up: async () => {
    const projects = await ShipmentProject._collection.aggregate([
      { $match: { deleted: { $ne: true } } },
      {
        $lookup: {
          from: "shipments",
          let: { projectId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$shipmentProjectInboundId", "$$projectId"] }
              }
            },
            {
              $match: {
                status: { $ne: "canceled" }
              }
            },
            { $project: { _id: 1 } }
          ],
          as: "inIds"
        }
      },
      {
        $lookup: {
          from: "shipments",
          let: { projectId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$shipmentProjectOutboundId", "$$projectId"] }
              }
            },
            {
              $match: {
                status: { $ne: "canceled" }
              }
            },
            { $project: { _id: 1 } }
          ],
          as: "outIds"
        }
      },
      { $project: { _id: 1, inIds: 1, outIds: 1 } }
    ]);

    // update shipment based on stage data
    const bulkOp = ShipmentProject._collection
      .rawCollection()
      .initializeUnorderedBulkOp();

    projects.forEach(({ _id, inIds, outIds }) => {
      bulkOp.find({ _id }).updateOne({
        $set: {
          inShipmentIds: inIds.map(l => l._id),
          outShipmentIds: outIds.map(l => l._id)
        }
      });
    });
    try {
      await bulkOp.execute();
    } catch (error) {
      console.error("migration 51 error:", error);
    }
  }
});

// noSQL script:
/*
const shipmentProject = db.getCollection("shipment.project");
const projects = shipmentProject
  .aggregate([
    { $match: { deleted: { $ne: true } } },
    {
      $lookup: {
        from: "shipments",
        let: { projectId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$shipmentProjectInboundId", "$$projectId"] }
            }
          },
          {
            $match: {
              status: {$ne: "canceled"}
            }
          },
          { $project: { _id: 1 } }
        ],
        as: "inIds"
      }
    },
    {
      $lookup: {
        from: "shipments",
        let: { projectId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$shipmentProjectOutboundId", "$$projectId"] }
            }
          },
          {
            $match: {
              status: {$ne: "canceled"}
            }
          },
          { $project: { _id: 1 } }
        ],
        as: "outIds"
      }
    },
    { $project: { _id: 1, inIds: 1, outIds: 1 } }
  ])
  .toArray();

// update shipment based on stage data
const bulkOp = shipmentProject.initializeUnorderedBulkOp();

projects.forEach(({ _id, inIds, outIds }) => {
  bulkOp.find({ _id }).updateOne({
    $set: {
      inShipmentIds: inIds.map(l => l._id),
      outShipmentIds: outIds.map(l => l._id)
    }
  });
});
try {
  bulkOp.execute();
} catch (error) {
  console.error("migration 51 error:", error);
}
*/
