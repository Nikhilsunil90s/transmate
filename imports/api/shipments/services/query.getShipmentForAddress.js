import { shipmentAggregation } from "./query.pipelineBuilder";

const debug = require("debug")("shipment:getShipmentForAddress");

export const getShipmentForAddress = ({ accountId, userId }) => ({
  userId,
  accountId,
  async get({ addressId }) {
    const srv = shipmentAggregation({ accountId });
    await srv.getUserEntities();
    srv
      .match({
        query: [
          {
            $or: [
              { "pickup.location.addressId": addressId },
              { "delivery.location.addressId": addressId }
            ]
          }
        ],
        options: { noStatusFilter: true },
        fieldsProjection: {
          id: "$_id",
          number: 1,
          status: 1,
          created: 1,
          direction: {
            $cond: {
              if: { $eq: [addressId, "$pickup.location.addressId"] },
              then: "out",
              else: "in"
            }
          }
        }
      })
      .add([{ $sort: { "created.at": -1 } }, { $limit: 10 }]);

    const res = await srv.fetchDirect();
    debug("aggregation result %o", res);

    return res;
  }
});
