import { Stage } from "/imports/api/stages/Stage";
import {
  CheckStageSecurity,
  shipmentFields,
  stageFields
} from "/imports/utils/security/checkUserPermissionsForStage.js";
import { StageSrv } from "./stageService";

import { shipmentAggregation } from "../../shipments/services/query.pipelineBuilder";

const SHIPMENT_FIELDS = { fields: shipmentFields };
const STAGE_FIELDS = { fields: stageFields };

export const confirmStage = ({ userId, accountId }) => ({
  userId,
  accountId,
  async init({ stageId }) {
    this.stage = await Stage.first(stageId, STAGE_FIELDS);
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
    check.can({ action: "confirmStage" });
    check.throw();
    return this;
  },
  async confirm({ dates }) {
    const srv = new StageSrv({
      shipment: this.shipment,
      stage: this.stage,
      accountId: this.accountId,
      userId: this.userId
    });
    await srv.confirmStage({ dates });
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
          status: 1,
          dates: 1
        }
      });
    const res = await srv.fetchDirect();
    return res[0] || {};
  }
});
