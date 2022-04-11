import moment from "moment";
import { Stage } from "/imports/api/stages/Stage";

export const queryBuilder = ({ accountId, userId }) => ({
  accountId,
  userId,
  pipeline: [],
  getStage({ stageId }) {
    this.pipeline = [
      ...this.pipeline,
      { $match: { _id: stageId } },
      { $replaceRoot: { newRoot: { stage: "$$ROOT" } } },
      { $addFields: { "stage.id": "$stage._id", id: "$stage._id" } }
    ];
    return this;
  },
  getStageByFilter() {
    this.pipeline = [
      ...this.pipeline,
      {
        $match: {
          driverId: this.userId,
          $or: [
            {
              status: {
                $nin: ["draft", "canceled", "completed"]
              }
            },
            {
              // Keep publishing completed shipments for a day, to prevent app errors
              status: "completed",
              "dates.delivery.departure.actual": {
                $gt: moment()
                  .startOf("day")
                  .toDate()
              }
            }
          ]
        }
      },
      { $replaceRoot: { newRoot: { stage: "$$ROOT" } } },
      { $addFields: { "stage.id": "$stage._id", id: "$stage._id" } }
    ];
    return this;
  },
  getShipment() {
    this.pipeline = [
      ...this.pipeline,
      {
        $lookup: {
          from: "shipments",
          let: { shipmentId: "$stage.shipmentId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$shipmentId"] } } },
            {
              $project: {
                id: "$_id",
                references: 1,
                notes: 1,
                number: 1,
                accountId: 1,
                carrierIds: 1,
                shipperId: 1
              }
            }
          ],
          as: "shipment"
        }
      },
      { $unwind: "$shipment" }
    ];
    return this;
  },
  getItems(withDetail: boolean) {
    this.pipeline = [
      ...this.pipeline,
      {
        $lookup: {
          from: "shipment.items",
          let: { shipmentId: "$stage.shipmentId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$shipmentId", "$$shipmentId"] },
                    { $eq: ["$level", 0] }
                  ]
                }
              }
            },
            {
              $project: {
                id: "$_id",
                quantity: 1,
                level: 1,
                description: 1,
                weight_net: 1,
                weight_gross: 1,
                weight_unit: 1,
                ...(withDetail
                  ? {
                      references: 1,
                      temperature: 1,
                      DG: 1,
                      DGClassType: 1,
                      notes: 1
                    }
                  : {})
              }
            } // add more fields
          ],
          as: "items"
        }
      }
    ];
    return this;
  },
  getDocuments() {
    this.pipeline = [
      ...this.pipeline,
      {
        $lookup: {
          from: "documents",
          let: { shipmentId: "$stage.shipmentId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$shipmentId", "$$shipmentId"] } } }
          ],
          as: "documents"
        }
      }
    ];
    return this;
  },
  getNonConformances() {
    this.pipeline = [
      ...this.pipeline,
      {
        $lookup: {
          from: "nonConformances",
          let: { shipmentId: "$stage.shipmentId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$shipmentId", "$$shipmentId"] } } }
          ],
          as: "nonConformances"
        }
      }
    ];
    return this;
  },
  async fetch() {
    const resultArray = await Stage._collection.aggregate(this.pipeline);
    return resultArray;
  }
});
