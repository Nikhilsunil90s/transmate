import { Shipment } from "/imports/api/shipments/Shipment";
import { Stage } from "/imports/api/stages/Stage";
import {
  CheckStageSecurity,
  shipmentFields,
  stageFields
} from "/imports/utils/security/checkUserPermissionsForStage.js";
import { StageSrv } from "./stageService";

const SHIPMENT_FIELDS = { fields: shipmentFields };
const STAGE_FIELDS = { fields: stageFields };

export const allocateStage = ({ accountId, userId }) => ({
  accountId,
  userId,
  async init({ stageId, allocation }) {
    this.stageId = stageId;
    this.allocation = allocation;
    this.stage = await Stage.first(stageId, STAGE_FIELDS);
    this.shipmentId = this.stage && this.stage.shipmentId;
    this.shipment =
      this.shipmentId &&
      (await Shipment.first({ _id: this.shipmentId }, SHIPMENT_FIELDS));
    return this;
  },
  async runChecks() {
    if (!this.stage && !this.shipment)
      throw new Meteor.Error("not-found", "Stage document not found");

    const check = new CheckStageSecurity(
      {
        stage: this.stage,
        shipment: this.shipment
      },
      {
        userId: this.userId,
        accountId: this.accountId
      }
    );
    await check.getUserRoles();
    check.can({ action: "assignDriver" });
    check.throw();
    return this;
  },
  async update() {
    await new StageSrv({
      shipment: this.shipment,
      stage: this.stage,
      accountId: this.accountId,
      userId: this.userId
    }).assignDriver({
      allocation: this.allocation
    });

    return this;
  },
  getUIResponse() {
    return this.stage.reload();
  }
});
