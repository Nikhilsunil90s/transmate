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

export const addShipmentToProject = ({ userId, accountId }) => ({
  userId,
  accountId,
  updateProject: {},
  updateShipment: {},
  async init({ projectId, shipmentId }) {
    this.projectId = projectId;
    this.shipmentId = shipmentId;
    this.shipmentProject = await ShipmentProject.first(
      projectId,
      PROJECT_FIELDS
    );
    this.shipment = await Shipment.first(shipmentId, SHIPMENT_FIELDS);
    SecurityChecks.checkIfExists(this.shipmentProject);
    SecurityChecks.checkIfExists(this.shipment);

    return this;
  },
  async addShipment({ type }) {
    if (type === "INBOUND") {
      this.updateProject = { $addToSet: { inShipmentIds: this.shipmentId } };
      this.updateShipment.shipmentProjectInboundId = this.projectId;
    } else {
      // type === "OUTBOUND"
      this.updateProject = { $addToSet: { outShipmentIds: this.shipmentId } };
      this.updateShipment.shipmentProjectOutboundId = this.projectId;
    }
    await ShipmentProject._collection.update(
      { _id: this.projectId },
      this.updateProject
    );
    await this.shipment.update_async(this.updateShipment);
    return this;
  },
  getUIResponse() {
    return true;
  }
});
