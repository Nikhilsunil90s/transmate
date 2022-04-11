import { Stage } from "/imports/api/stages/Stage";
import { Shipment } from "/imports/api/shipments/Shipment";
import SecurityChecks from "/imports/utils/security/_security";
import { shipmentAggregation } from "./query.pipelineBuilder";
import { CheckShipmentSecurity } from "/imports/utils/security/checkUserPermissionForShipment";
import { setShipmentNotificationFlags } from "../../notifications/helpers/setShipmentNotificationFlags";

const debug = require("debug")("shipments:resolvers");

const shipmentFields = {
  accountId: 1,
  carrierIds: 1,
  customerId: 1,
  providerIds: 1,
  priceListId: 1,
  costs: 1,
  number: 1,
  status: 1
};

// resets costs & removes link with priceRequestId
export const resetShipmentCosts = ({ accountId, userId }) => ({
  accountId,
  userId,
  async init({ shipmentId }) {
    this.shipmentId = shipmentId;
    this.shipment = await Shipment.first(shipmentId, {
      fields: shipmentFields
    });
    SecurityChecks.checkIfExists(this.shipment);
    const check = new CheckShipmentSecurity(
      {
        shipment: this.shipment
      },
      { accountId: this.accountId, userId: this.userId }
    );
    await check.getUserRoles();
    check.can({ action: "resetCosts" }).throw();
    return this;
  },
  async reset() {
    // remove selected carrier
    // remove all costs from the cost array
    // remove linked priceRequest
    const { carrierIds = [] } = this.shipment;
    await this.shipment.update_async({
      costs: [],
      carrierIds: [],
      priceRequest: null
    });

    await this.shipment.addUpdate("costs", { event: "reset" }, this.context);

    await Stage._collection.update(
      { shipmentId: this.shipmentId },
      { $unset: { carrierId: 1 } },
      { multi: true }
    );

    // notification flags:
    setShipmentNotificationFlags({
      shipmentId: this.shipmentId
    }).removeNotificationsForAccounts(carrierIds);

    return this;
  },
  async fetchReturnData() {
    const srv = shipmentAggregation({
      accountId: this.accountId,
      userId: this.userId
    });
    await srv.getUserEntities();
    srv.matchId({ shipmentId: this.shipmentId });
    srv
      .match({
        fieldsProjection: {
          accountId: 1,
          status: 1,
          carrierIds: 1,
          costs: 1, // costs
          costParams: 1, // costs
          created: 1, // costs
          priceRequestId: 1
        }
      })
      .getLinks()
      .getCostDescriptions();

    const res = await srv.fetchDirect();
    debug("aggregation result %O", res);

    return res[0] || {};
  }
});
