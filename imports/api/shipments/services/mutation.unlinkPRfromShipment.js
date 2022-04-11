import SecurityChecks from "/imports/utils/security/_security";
import { CheckShipmentSecurity } from "/imports/utils/security/checkUserPermissionForShipment";
import { shipmentAggregation } from "./query.pipelineBuilder";
import { PriceRequest } from "../../priceRequest/PriceRequest";
import { Shipment } from "../Shipment";

export const unlinkPriceRequestFromShipment = ({ accountId, userId }) => ({
  context: {
    accountId,
    userId
  },
  async init({ shipmentId }) {
    this.shipmentId = shipmentId;
    this.shipment = await Shipment.first(shipmentId, {
      fields: { status: 1, accountId: 1, priceRequestId: 1 }
    });
    SecurityChecks.checkIfExists(this.shipment);
    SecurityChecks.checkIfExists(this.shipment.priceRequestId);
    this.priceRequest = await PriceRequest.first(this.shipment.priceRequestId, {
      fields: { status: 1 }
    });

    SecurityChecks.checkIfExists(this.priceRequest);
    return this;
  },
  async runChecks() {
    const roleCheck = new CheckShipmentSecurity(
      {
        shipment: this.shipment
      },
      this.context
    );
    await roleCheck.getUserRoles();
    roleCheck
      .can({
        action: "unlinkPriceRequest",
        data: { status: this.priceRequest.status }
      })
      .throw();
    return this;
  },
  async unlink() {
    // unlink from shipment.... we are not removing it from the PR
    await this.shipment.del_async("priceRequestId");
    return this;
  },
  async getUIResponse() {
    const srv = shipmentAggregation({ accountId, userId });
    await srv.getUserEntities();
    srv
      .matchId({ shipmentId: this.shipmentId })
      .match({
        options: { noStatusFilter: true },
        fieldsProjection: {
          priceRequestId: 1,
          shipmentProjectInboundId: 1,
          shipmentProjectOutboundId: 1
        }
      })
      .getLinks();

    const res = await srv.fetchDirect();
    return res[0] || {};
  }
});
