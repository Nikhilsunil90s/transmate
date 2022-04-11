import { JobManager } from "../../../utils/server/job-manager";
import { Shipment } from "../Shipment";
import { ShipmentType } from "../interfaces/Shipment";
import SecurityChecks from "/imports/utils/security/_security";

interface ConfirmShipmentRequest {
  accountId: string;
  userId: string;
  shipmentId?: string;
  shipment?: Partial<ShipmentType>;
  init: (
    this: ConfirmShipmentRequest,
    a: { shipmentId: string }
  ) => Promise<ConfirmShipmentRequest>;
  runChecks: (this: ConfirmShipmentRequest) => ConfirmShipmentRequest;
  confirmRequest: (
    this: ConfirmShipmentRequest
  ) => Promise<ConfirmShipmentRequest>;
  triggerNotifications: (this: ConfirmShipmentRequest) => void;
  getUIResponse: () => { status: string };
}

export const confirmShipmentRequest = ({
  accountId,
  userId
}): ConfirmShipmentRequest => ({
  accountId,
  userId,
  async init({ shipmentId }) {
    this.shipmentId = shipmentId;
    this.shipment = await Shipment.first(shipmentId, {
      fields: { status: 1, request: 1 }
    });
    return this;
  },
  runChecks() {
    SecurityChecks.checkIfExists(this.shipment);
    SecurityChecks.checkIfExists(this.shipment.request);

    if (!!this.shipment.request.submittedOn)
      throw new Error("Request already submitted");
    return this;
  },
  async confirmRequest() {
    // check if request && is not yet requested

    // actions:
    // 1. put in draft
    // 2. trigger a notification

    await this.shipment.update_async({
      status: "draft",
      "request.submittedOn": new Date(),
      "request.status": "submitted"
    });
    await this.shipment.reload();
    return this;
  },
  triggerNotifications() {
    JobManager.post("shipment.request", {
      userId: this.userId,
      accountId: this.accountId,
      shipmentId: this.shipmentId
    });
  },
  getUIResponse() {
    return this.shipment;
  }
});
