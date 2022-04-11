import { Stage } from "/imports/api/stages/Stage";
import { Address } from "../../addresses/Address";
import {
  CheckStageSecurity,
  shipmentFields as shipFieldSecurity
} from "/imports/utils/security/checkUserPermissionsForStage.js";
import { StageSrv } from "./stageService";
import { shipmentAggregation } from "../../shipments/services/query.pipelineBuilder";

export const updateStageLocation = ({ userId, accountId }) => ({
  userId,
  accountId,
  async init({ stageId, stop, location, overrides }) {
    this.stageId = stageId;
    this.stop = stop;
    this.location = location;
    this.overrides = overrides;

    this.stage = await Stage.first(stageId);
    this.address =
      location && location.type === "address"
        ? await Address.first({
            _id: location.id,
            "accounts.id": accountId
          })
        : await Address.first({
            "accounts.id": accountId
          });

    this.shipment =
      this.stage &&
      (await this.stage.getShipment({
        fields: { ...shipFieldSecurity }
      }));
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
    check.can({ action: "changeAddress" });
    check.throw();
    return this;
  },
  async update() {
    const srv = new StageSrv({
      shipment: this.shipment,
      stage: this.stage,
      accountId: this.accountId,
      userId: this.userId,
      address: this.address
    });
    await srv.getStageCount();
    await srv.updateAddress({
      stop: this.stop,
      location: this.location,
      overrides: this.overrides
    });
    return this;
  },
  async getUIResponse() {
    // returns the updated shipment fields and stage fields to the UI:
    const srv = shipmentAggregation({ accountId })
      .matchId({ shipmentId: this.shipment.id })
      .match({
        options: { noAccountFilter: true },
        fieldsProjection: { id: "$_id", status: 1, pickup: 1, delivery: 1 }
      })
      .getStages({
        fields: {
          id: "$_id",
          status: 1,
          from: 1,
          to: 1
        }
      });
    const res = await srv.fetchDirect();
    return res[0] || {};
  }
});
