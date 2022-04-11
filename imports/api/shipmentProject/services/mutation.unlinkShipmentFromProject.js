import { ShipmentProject } from "/imports/api/shipmentProject/ShipmentProject";
import { Shipment } from "/imports/api/shipments/Shipment";
import SecurityChecks from "/imports/utils/security/_security";

const PROJECT_FIELDS = {
  fields: {
    planners: 1,
    inShipmentIds: 1,
    outShipmentIds: 1,
    status: 1,
    accountId: 1
  }
};

const SHIPMENT_FIELDS = { fields: { status: 1, accountId: 1 } };

export const unlinkShipmentFromProject = ({ userId, accountId }) => ({
  userId,
  accountId,
  async init({ shipmentId, projectId, type }) {
    this.shipmentId = shipmentId;
    this.projectId = projectId;
    this.type = type;

    this.project = await ShipmentProject.first(projectId, PROJECT_FIELDS);
    this.shipment = await Shipment.first(shipmentId, SHIPMENT_FIELDS);
    this.projectOwnerAccountId = this.project.accountId;

    SecurityChecks.checkIfExists(this.project);
    SecurityChecks.checkIfExists(this.shipment);
    return this;
  },
  async unlink() {
    if (this.type === "OUTBOUND") {
      await this.shipment.del_async("shipmentProjectOutboundId");
      await this.project.pull_async({
        outShipmentIds: this.shipmentId
      });
      return this;
    }
    if (this.type === "INBOUND") {
      await this.shipment.del_aync("shipmentProjectInboundId");
      await this.project.pull_async({ inShipmentIds: this.shipmentId });
      return this;
    }
    throw new Error(`Unkonw type: ${this.type}`);
  },

  getUIResponse() {
    return true;
  }
});
