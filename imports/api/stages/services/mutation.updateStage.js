import { Shipment } from "/imports/api/shipments/Shipment";
import { Stage } from "/imports/api/stages/Stage";
import {
  CheckStageSecurity,
  shipmentFields as shipFieldSecurity
} from "/imports/utils/security/checkUserPermissionsForStage.js";
import { updateStage, shipmentFields } from "./stage-update";
import { shipmentAggregation } from "../../shipments/services/query.pipelineBuilder";

export const updateStageMutation = ({ userId, accountId }) => ({
  userId,
  accountId,
  async init({ stageId, updates }) {
    this.stageId = stageId;
    this.updates = updates;
    this.stage = await Stage.first(stageId);
    this.shipmentId = this.stage && this.stage.shipmentId;
    this.shipment =
      this.shipmentId &&
      (await Shipment.first(
        { _id: this.shipmentId },
        { fields: { ...shipmentFields, ...shipFieldSecurity } }
      ));
    return this;
  },
  async runChecks() {
    if (!this.stage && !this.shipment)
      throw new Meteor.Error("not-found", "Stage document not found");

    const check = new CheckStageSecurity(
      {
        stage: this.stage,
        update: this.updates,
        shipment: this.shipment
      },
      {
        accountId: this.accountId,
        userId: this.userId
      }
    );
    await check.getUserRoles();
    check.can({ action: "updateStage" });
    check.throw();
    return this;
  },
  async updateStage() {
    const { sUpdates } = await updateStage({
      updates: this.updates,
      shipment: this.shipment,
      stage: this.stage,
      accountId: this.accountId
    });
    this.sUpdates = sUpdates; // for audit trail
    return this;
  },
  async getUIResponse() {
    // returns the updated shipment fields and stage fields to the UI:
    const srv = shipmentAggregation({ accountId })
      .matchId({ shipmentId: this.shipment.id })
      .match({
        options: { noAccountFilter: true },
        fieldsProjection: { id: "$_id", status: 1 }
      })
      .getStages({
        fields: {
          id: "$_id",
          status: 1,
          from: 1,
          to: 1,
          dates: 1,
          mode: 1
        }
      });
    const res = await srv.fetchDirect();
    return res[0] || {};
  }
});
