import moment from "moment";
import { ShipmentProject } from "/imports/api/shipmentProject/ShipmentProject";

const debug = require("debug")("projects:getAvailableShipments");

export const getAvailableShipments = ({ accountId }) => ({
  accountId,
  async get({ type }) {
    debug("start get type %o ", type);

    // type is "inbound" => we need all that are linked to project outbound and where inbound is empty
    const keyToBeEmpty =
      type === "INBOUND"
        ? "shipmentProjectInboundId"
        : "shipmentProjectOutboundId";

    const keyToMatch =
      type === "INBOUND"
        ? "shipmentProjectOutboundId"
        : "shipmentProjectInboundId";

    const currentYear = parseInt(moment().format("YYYY"), 10);

    const pipeline = [
      {
        $match: {
          accountId: this.accountId,
          year: { $in: [currentYear, currentYear - 1] }
        }
      },
      { $project: { title: 1, type: 1, year: 1 } },
      {
        $lookup: {
          from: "shipments",
          let: { projectId: "$_id" },
          pipeline: [
            {
              $match: {
                $and: [
                  { [keyToBeEmpty]: { $exists: false } },
                  {
                    $expr: {
                      $eq: [`$${keyToMatch}`, "$$projectId"]
                    }
                  },
                  { status: { $nin: ["completed", "canceled"] } }
                ]
              }
            },
            { $project: { references: 1, number: 1, status: 1, created: 1 } }
          ],
          as: "shipments"
        }
      },
      { $unwind: "$shipments" },
      { $sort: { "created.at": -1 } },
      {
        $project: {
          id: "$shipments._id",
          shipperReference: "$shipments.references.number",
          number: "$shipments.number",
          status: "$shipments.status",
          projectTitle: "$title"
        }
      }
    ];
    const shipments = await ShipmentProject._collection.aggregate(pipeline);
    debug("end get type %o ", type);
    return shipments;
  }
});
