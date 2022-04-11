import { shipmentAggregation } from "./query.pipelineBuilder";

const debug = require("debug")("shipment:getAll");

const shipmentFields = {
  _id: 1,
  id: "$_id",
  number: 1,
  accountId: 1,
  shipperId: 1,
  consigneeId: 1,
  providerIds: 1,
  carrierIds: 1,
  type: 1,
  status: 1,
  references: 1,
  costParams: 1, // for costs
  costs: 1, // for costs
  totalCost: {
    $reduce: {
      input: { $ifNull: ["$costs", []] },
      initialValue: 0,
      in: { $sum: ["$$value", { $ifNull: ["$$this.amount.value", 0] }] }
    }
  },
  created: 1
};

const stageFields = {
  id: "$_id",
  sequence: 1,
  dates: 1,
  carrierId: 1,
  from: 1,
  to: 1
};

export const getShipmentStageReleaseData = ({ accountId }) => ({
  accountId,
  async get({ shipmentId, stageId }) {
    const srv = shipmentAggregation({ accountId })
      .matchId({ shipmentId })
      .match({
        options: { noAccountFilter: true },
        fieldsProjection: shipmentFields
      })
      .getStages({ filters: { stageId }, fields: stageFields })
      .add([{ $unwind: { path: "$stages", preserveNullAndEmptyArrays: true } }])
      .getAccountData({ partner: "shipper" })
      .getAccountData({ partner: "account" })
      .getAccountData({ partner: "consignee" })
      .getAccountData({ partner: "sCarrier" })
      .add([{ $addFields: { carrier: "$sCarrier" } }])
      .getAddressAnnotation({ path: "stages.from" })
      .getAddressAnnotation({ path: "stages.to" })
      .getItems({}) // todo: get the item information from the settings!!
      .getSettingsData("entity")
      .getPlanners()
      .add([
        {
          $project: {
            id: 1,
            accountId: 1,
            account: 1,
            shipper: 1,
            carrier: 1, // = stage carrier
            consignee: 1,
            entity: 1,
            number: 1,
            references: 1,
            stage: "$stages",
            stageCount: 1,
            nestedItems: 1,
            planners: 1
          }
        }
      ]);

    const res = await srv.fetchDirect();

    debug("aggregation result %o", res);

    return res[0];
  }
});
