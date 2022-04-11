import { shipmentAggregation } from "/imports/api/shipments/services/query.pipelineBuilder";

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
  pickingStatus: 1
};

// returns all shipments that are FULLY picked and ready to be shipped!
// carrierId can optionally be passed in
export const getShipmentsForManifest = ({ accountId, userId }) => ({
  accountId,
  userId,
  async getShipments({ addressId, carrierId }) {
    const srv = shipmentAggregation({ accountId, userId });
    await srv.getUserEntities();
    return srv
      .match({
        fieldsProjection: FIELDS,
        query: [
          {
            "pickup.location.addressId": addressId,
            status: "planned",
            pickingStatus: "packed",
            ...(carrierId ? { carrierIds: carrierId } : {})
          }
        ]
      })
      .getAccountData({ partner: "carrier" })
      .fetchDirect();
  }
});
