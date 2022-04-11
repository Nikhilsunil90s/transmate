import get from "lodash.get";
import { Shipment } from "/imports/api/shipments/Shipment";
import SecurityChecks from "/imports/utils/security/_security";
import { shipmentAggregation } from "./query.pipelineBuilder";
import { CheckShipmentSecurity } from "/imports/utils/security/checkUserPermissionForShipment";

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

export const approveDeclineShipmentCosts = ({ accountId, userId }) => ({
  accountId,
  userId,
  context: { accountId, userId },
  async init({ shipmentId, index }) {
    this.shipmentId = shipmentId;
    this.index = index;
    this.shipment = await Shipment.first(shipmentId, {
      fields: shipmentFields
    });
    SecurityChecks.checkIfExists(this.shipment);

    const cost = get(this.shipment, ["costs", index]);

    const check = new CheckShipmentSecurity(
      {
        shipment: this.shipment
      },
      { accountId: this.accountId, userId: this.userId }
    );
    await check.getUserRoles();
    check
      .can({
        action: "approveDeclineCost",
        data: { cost }
      })
      .throw();
    return this;
  },

  async approve() {
    await this.shipment.update_async({
      [`costs.${this.index}.response.approved`]: true,
      [`costs.${this.index}.forApproval`]: false,
      [`costs.${this.index}.response.responded`]: {
        by: this.userId,
        at: new Date()
      }
    });

    await this.shipment.reload();
    await this.shipment.addUpdate(
      "costs",
      { index: this.index, event: "approve" },
      this.context
    );
    await this.shipment.updateFlags("approve-costs");

    return this;
  },
  async decline({ response }) {
    await this.shipment.update_async({
      [`costs.${this.index}.response`]: {
        ...response,
        approved: false,
        responded: {
          by: this.userId,
          at: new Date()
        }
      },
      [`costs.${this.index}.forApproval`]: false
    });
    await this.shipment.reload();
    await this.shipment.addUpdate(
      "costs",
      { index: this.index, event: "decline" },
      this.context
    );
    await this.shipment.updateFlags("approve-costs");

    return this;
  },
  async fetchReturnData() {
    const srv = shipmentAggregation({
      accountId: this.accountId,
      userId: this.userId
    });
    await srv.getUserEntities();
    srv
      .matchId({ shipmentId: this.shipmentId })
      .match({
        fieldsProjection: {
          accountId: 1,
          status: 1,
          carrierIds: 1,
          costs: 1, // costs
          costParams: 1, // costs
          created: 1 // costs
        }
      })
      .getCostDescriptions();

    const res = await srv.fetchDirect();
    debug("aggregation result %o", res);

    return res[0] || {};
  }
});
