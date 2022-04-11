import { shipmentAggregation } from "./query.pipelineBuilder";

const debug = require("debug")("shipment:getShipment");

export const getShipment = ({ accountId, userId }) => ({
  accountId,
  userId,
  async get({ shipmentId }) {
    const srv = shipmentAggregation({ accountId, userId });
    await srv.getUserEntities();
    srv
      .matchId({ shipmentId })
      .match({
        options: { noStatusFilter: true },
        fieldsProjection: {
          pickup: 1,
          delivery: 1,
          number: 1,
          type: 1,
          serviceLevel: 1,
          incoterm: 1,
          status: 1,
          plannerIds: 1,
          accountId: 1,
          shipperId: 1,
          consigneeId: 1,
          carrierIds: 1,
          providerIds: 1,
          priceRequestId: 1,
          "access.accountId": 1,
          stageIds: 1,
          errors: 1,
          meta: 1,
          demo: 1,
          flags: 1,
          tags: 1,
          references: 1,
          trackingNumbers: 1,
          notes: 1,
          nonConformanceIds: 1,
          shipmentProjectInboundId: 1,
          shipmentProjectOutboundId: 1,

          // costs: 1,
          costParams: 1,
          drivingDistance: 1,
          drivingDuration: 1,
          sphericalDistance: 1,
          created: 1,
          updated: 1,
          isArchived: 1,
          deleted: 1,
          updates: 1,
          simulation: 1,
          tracking: 1,

          // request:
          request: 1
        }
      })
      .getAccountData({ partner: "account" })
      .getAccountData({ partner: "carrier" })
      .getAccountData({ partner: "shipper" })
      .getAccountData({ partner: "consignee" })
      .getLinks()
      .getDocuments()
      .getItems({})
      .getNonConformances()
      .getStages({
        fields: {
          id: "$_id",
          mode: 1,
          status: 1,
          shipmentId: 1,
          sequence: 1,
          carrierId: 1,
          from: 1,
          to: 1,

          drivingDistance: 1,
          drivingDuration: 1,
          sphericalDistance: 1,

          vehicleId: 1,
          trailerId: 1,
          plate: 1,
          driverId: 1,
          created: 1,
          released: 1,
          dates: 1
        }
      });

    /*
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
      ]);*/

    const res = await srv.fetchDirect();
    debug("aggregation result %o", res);

    return res[0] || {};
  }
});
