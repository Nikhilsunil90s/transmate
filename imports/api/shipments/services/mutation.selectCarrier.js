import { Shipment } from "/imports/api/shipments/Shipment";
import SecurityChecks from "/imports/utils/security/_security";
import { shipmentAggregation } from "./query.pipelineBuilder";
import { CheckShipmentSecurity } from "/imports/utils/security/checkUserPermissionForShipment";
import { ShipmentService } from "./shipments";

const debug = require("debug")("shipments:resolvers:selectCarrier");

const shipmentFields = {
  _id: 1,
  accountId: 1,
  carrierIds: 1,
  customerId: 1,
  providerIds: 1,
  priceListId: 1,
  costs: 1,
  number: 1,
  status: 1
};

export const selectCarrier = ({ accountId, userId }) => ({
  accountId,
  userId,
  context: { accountId, userId },
  async init({ shipmentId }) {
    this.shipmentId = shipmentId;
    this.shipment = await Shipment.first(shipmentId, {
      fields: shipmentFields
    });
    debug("shipment %o", this.shipment);
    SecurityChecks.checkIfExists(this.shipment);
    const check = new CheckShipmentSecurity(
      {
        shipment: this.shipment
      },
      { accountId: this.accountId, userId: this.userId }
    );
    await check.getUserRoles();
    check.can({ action: "selectCarrier" }).throw();
    return this;
  },

  /**
   *
   * @param {{priceListId: string, carrierId: string, priceListResult: any}} param0
   * @returns this
   */
  async select({ priceListId, carrierId, priceListResult }) {
    const srv = new ShipmentService({
      shipment: this.shipment,
      ...this.context
    });

    // sets|unsets the carrierId and priceListId
    await srv.selectCarrier({
      priceListId,
      carrierId
    });

    // the selected option (priceListResult) will be combined with existing costing data
    // the priceListId should be set to the shipment
    // if no priceListId > no cost will be updated!
    await srv.updateCosts({ priceListResult });
    return this;
  },
  async fetchReturnData() {
    const srv = shipmentAggregation({ accountId: this.accountId });
    srv.matchId({ shipmentId: this.shipmentId });
    srv
      .match({
        options: { noAccountFilter: true },
        fieldsProjection: {
          accountId: 1,
          status: 1,
          carrierIds: 1,
          costs: 1, // costs
          costParams: 1, // costs
          created: 1 // costs
        }
      })
      .getAccountData({ partner: "carrier" })
      .getCostDescriptions();

    const res = await srv.fetchDirect();
    debug("aggregation result %o", res);

    return res[0] || {};
  }
});
