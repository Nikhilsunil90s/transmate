import { shipmentAggregation } from "/imports/api/shipments/services/query.pipelineBuilder";

const debug = require("debug")("shipment:picking:services");

export const ITEM_FIELDS = {
  type: 1,
  itemType: 1,
  description: 1,
  level: 1,
  parentItemId: 1,
  references: 1,
  DG: 1,
  quantity: 1,
  weight_net: 1,
  weight_gross: 1,
  weight_unit: 1,
  temperature: 1,
  dimensions: 1,
  isPicked: 1,
  isPackingUnit: 1,
  labelUrl: 1
};

const FIELDS = {
  _id: 1,
  id: "$_id",
  number: 1,
  accountId: 1,
  shipperId: 1,
  providerIds: 1,
  carrierIds: 1,
  type: 1,
  status: 1,
  references: 1,
  pickup: 1,
  delivery: 1,
  pickingStatus: 1,
  trackingNumbers: 1
};

export const getPickingDetail = ({ accountId, userId }) => ({
  accountId,
  userId,
  context: { accountId, userId },
  async get({ shipmentId }) {
    debug("get shipment detail for ", shipmentId);
    const srv = shipmentAggregation(this.context);

    await srv.getUserEntities();
    const arr = await srv
      .matchId({ shipmentId })
      .match({
        fieldsProjection: FIELDS
      })
      .getAccountData({ partner: "shipper" })
      .getAccountData({ partner: "carrier" })
      .getItems({ depth: 4, fields: ITEM_FIELDS, types: ["HU"] })
      .fetchDirect();
    return arr[0];
  }
});
