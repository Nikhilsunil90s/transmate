import moment from "moment";
import { shipmentAggregation } from "/imports/api/shipments/services/query.pipelineBuilder";

const FIELDS = {
  _id: 1,
  id: "$_id",
  carrierIds: 1,
  status: 1,
  pickingStatus: 1,
  number: 1,
  references: 1
};

export const getDataForManifest = ({ accountId, userId }) => ({
  accountId,
  userId,

  async init({ addressId }) {
    this.addressId = addressId;
    return this;
  },
  async get() {
    const srv = shipmentAggregation({ accountId, userId });
    await srv.getUserEntities();
    return srv
      .match({
        fieldsProjection: FIELDS,
        query: [
          {
            "pickup.location.addressId": this.addressId,
            pickingStatus: { $in: ["printed"] },

            // either all draft shipments that have "printed picking"
            // either all shipments that have "printed picking" and have actual on today (==printed today)
            $or: [
              { status: { $in: ["draft"] } },
              {
                $and: [
                  {
                    "pickup.dateActual": {
                      $gte: moment()
                        .startOf("day")
                        .toDate()
                    }
                  },
                  {
                    "pickup.dateActual": {
                      $lte: moment()
                        .endOf("day")
                        .toDate()
                    }
                  }
                ]
              }
            ]
          }
        ]
      })
      .getAccountData({ partner: "carrier" })
      .add([
        {
          $group: {
            _id: "$carrier",
            shipments: { $push: "$$ROOT" }
          }
        },
        {
          $project: {
            carrierId: "$_id.id",
            name: "$_id.name",
            shipments: "$shipments"
          }
        }
      ])
      .fetchDirect();
  }
});
