import { Stage } from "/imports/api/stages/Stage";
import {
  CheckStageSecurity,
  shipmentFields
} from "/imports/utils/security/checkUserPermissionsForStage";
import { StageSrv } from "./stageService";

import { shipmentAggregation } from "../../shipments/services/query.pipelineBuilder";

const SHIPMENT_FIELDS = { fields: shipmentFields };

export const setStatus = ({ userId, accountId }) => ({
  userId,
  accountId,
  async init({ stageId }) {
    this.stage = await Stage.first(stageId);
    this.shipment =
      this.stage && (await this.stage.getShipment(SHIPMENT_FIELDS));
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
    check.can({ action: "setStatus" }).throw();
    return this;
  },
  async update({ status }) {
    const srv = new StageSrv({
      shipment: this.shipment,
      stage: this.stage,
      accountId: this.accountId,
      userId: this.userId
    });

    await srv.getStageCount();
    await srv.setStatus({ status });
    await srv.verifyShipmentStatus({ status });

    return this;
  },
  async fetchData() {
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
          status: 1
        }
      });
    const res = await srv.fetchDirect();
    return res[0] || {};
  }
});
