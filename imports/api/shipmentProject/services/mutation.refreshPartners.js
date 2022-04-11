import { ShipmentProject } from "/imports/api/shipmentProject/ShipmentProject";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";

const PROJECT_FEATURE_VIEW = "shipmentProjects";

export const refreshPartners = ({ userId, accountId }) => ({
  userId,
  accountId,
  async getProject({ shipmentProjectId }) {
    this.shipmentProjectId = shipmentProjectId;
    this.project = await ShipmentProject.first(shipmentProjectId, {
      fields: { accountId: 1 }
    });
    this.projectOwnerAccountId = this.project.accountId;
    return this;
  },
  async getPartners() {
    const groupedPartners = (
      await ShipmentProject._collection.aggregate([
        { $match: { _id: this.shipmentProjectId } },
        {
          $project: {
            _id: 1,
            shipmentIds: {
              $concatArrays: [
                { $ifNull: ["$inShipmentIds", []] },
                { $ifNull: ["$outShipmentIds", []] }
              ]
            }
          }
        },
        {
          $lookup: {
            from: "shipments",
            let: { shipmentIds: "$shipmentIds" },
            pipeline: [
              { $match: { $expr: { $in: ["$_id", "$$shipmentIds"] } } },
              { $match: { deleted: false, status: { $ne: "canceled" } } },
              {
                $project: {
                  id: "$_id",
                  _id: 1,
                  carrierIds: 1,
                  shipperId: 1,
                  consigneeId: 1
                }
              }
            ],
            as: "shipment"
          }
        },
        { $unwind: "$shipment" },
        {
          $unwind: {
            path: "$shipment.carrierIds",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: null,
            shipperIds: { $addToSet: "$shipment.shipperId" },
            consigneeIds: { $addToSet: "$shipment.consigneeId" },
            carrierIds: { $addToSet: "$shipment.carrierIds" }
          }
        }
      ])
    )[0];

    this.partners = await AllAccounts._collection.aggregate([
      {
        $match: {
          $and: [
            {
              _id: {
                $in: [
                  ...groupedPartners.shipperIds,
                  ...groupedPartners.consigneeIds,
                  ...groupedPartners.carrierIds
                ]
              }
            },
            { _id: { $ne: this.projectOwnerAccountId } }
          ]
        }
      },
      {
        $addFields: {
          annotation: {
            $arrayElemAt: [
              {
                $filter: {
                  input: { $ifNull: ["$accounts", []] },
                  as: "annotation",
                  cond: { $eq: ["$$annotation.accountId", this.accountId] }
                }
              },
              0
            ]
          }
        }
      },

      {
        $addFields: {
          name: { $ifNull: ["$annotation.name", "$name"] }
        }
      },
      { $project: { name: 1, id: "$_id", _id: 0 } },
      { $sort: { name: 1 } }
    ]);

    return this;
  },
  async saveInProject() {
    await this.project.update_async({ partners: this.partners });
    return this;
  },
  async giveAccountsAccessToProjectsOverview() {
    const accountIds = this.partners.map(({ id }) => id);
    await AllAccounts._collection.update(
      { _id: { $in: accountIds } },
      { $addToSet: { features: PROJECT_FEATURE_VIEW } },
      { multi: true }
    );
    return this;
  },
  getUIResponse() {
    return {
      id: this.shipmentProjectId,
      partners: this.partners
    };
  }
});
