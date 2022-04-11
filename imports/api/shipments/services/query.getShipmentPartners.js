import { shipmentAggregation } from "./query.pipelineBuilder";

const debug = require("debug")("shipment:getpartners");

export const getShipmentPartners = ({ accountId }) => ({
  accountId,
  async get({ shipmentId }) {
    const srv = shipmentAggregation({ accountId })
      .matchId({ shipmentId })
      .match({
        options: { noAccountFilter: true },
        fieldsProjection: {
          accountId: 1,
          shipperId: 1,
          providerIds: 1,
          consigneeId: 1
        }
      })
      .getAccountData({ partner: "shipper" })
      .getAccountData({ partner: "consignee" })
      .add([
        { $unwind: { path: "$providerIds", preserveNullAndEmptyArrays: true } }
      ])
      .getAccountData({ partner: "providers" })
      .add([
        {
          $group: {
            _id: {
              id: "$id",
              accountId: "$accountId",
              shipperId: "$shipperId",
              shipper: "$shipper",
              consigneeId: "$consigneeId",
              consignee: "$consignee"
            },
            providerIds: { $push: "$providers.id" },
            providers: { $push: "$providers" }
          }
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                "$_id",
                {
                  providerIds: "$providerIds",
                  providers: "$providers"
                }
              ]
            }
          }
        }
      ]);
    const res = await srv.fetchDirect();

    debug("aggregation result %o", res);

    return res[0] || {};
  }
});
