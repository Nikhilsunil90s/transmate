import { shipmentAggregation } from "../../shipments/services/query.pipelineBuilder";
import { ShipmentProject } from "../ShipmentProject";
import {
  CheckProjectSecurity,
  dbFields
} from "/imports/utils/security/checkUserPermissionForProject";
import SecurityChecks from "/imports/utils/security/_security";

const debug = require("debug")("projects:byShipment");

const PROJECT_FIELDS = {
  ...dbFields,
  accountId: 1,
  planners: 1,
  partners: 1
};

const ITEM_FIELDS = {
  commodity: 1,
  references: 1,
  temperature: 1,
  quantity: 1,
  description: 1
};

/** returns shipmentAggr
 * costs are filtered out in client side only
 * data is enriched with canViewCost attribute
 *
 */
export const getShipmentsByShipmentProject = ({ accountId, userId }) => ({
  accountId,
  userId,
  async init({ shipmentProjectId }) {
    this.shipmentProjectId = shipmentProjectId;
    this.shipmentProject = await ShipmentProject.first(shipmentProjectId, {
      fields: PROJECT_FIELDS
    });
    SecurityChecks.checkIfExists(this.shipmentProject);
    this.canViewCosts = new CheckProjectSecurity(
      {
        project: this.shipmentProject
      },
      { accountId, userId }
    )
      .can({ action: "viewCosts" })
      .check();
    return this;
  },
  async get({ type }) {
    debug("start get %o ", this.shipmentProjectId);
    const inboundOutboundKey =
      type === "INBOUND"
        ? "shipmentProjectInboundId"
        : "shipmentProjectOutboundId";

    const srv = shipmentAggregation({ accountId, userId });

    await srv.getUserEntities();
    const shipments = await srv
      .match({
        query: [{ [inboundOutboundKey]: this.shipmentProjectId }]
      })
      .getAccountData({ partner: "carrier" })
      .getAccountData({ partner: "shipper" })
      .getAddressAnnotation({ stop: "pickup" })
      .getAddressAnnotation({ stop: "delivery" })
      .getFirstItem({ fields: ITEM_FIELDS })
      .getCostExchangeRates({})
      .calculateTotalCosts()
      .fetchDirect();

    // remove costs if the user can't see it.
    return shipments.map(({ totals, costs, ...shipment }) => ({
      ...shipment,
      ...(this.canViewCosts ? { totals, costs } : {})
    }));
  }
});
