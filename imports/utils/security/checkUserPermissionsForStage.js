import get from "lodash.get";
import { SecurityCheck } from "./_securityCheck";
import { getRoleForShipmentObj } from "./_checkRoleInShipment";
import { getRoleForStageObj } from "./_checkRoleInStage";

import { checkShipmentStatus } from "/imports/utils/security/_checkShipmentStatus";
import { checkUpdateFields } from "/imports/utils/security/_checkUpdateFields";
import { checkStageStatus } from "/imports/utils/security/_checkStageStatus";

// const debug = require("debug")("stage:security");

export const stageFields = {
  status: 1,
  carrierId: 1,
  sequence: 1,
  shipmentId: 1,
  dates: 1
};

export const shipmentFields = {
  status: 1,
  accountId: 1,
  shipperId: 1,
  consigneeId: 1,
  carrierIds: 1,
  providerIds: 1,
  stageIds: 1
};

class CheckStageSecurity extends SecurityCheck {
  // eslint-disable-next-line no-unused-vars
  constructor(
    { stage, update, shipment, stageCount = 1 },
    { accountId, userId }
  ) {
    super({ accountId, userId });

    // specific here:
    this.shipment = shipment;
    this.stage = stage;
    this.stageCount = stageCount;
    this.stageStatus = get(stage, "status");
    this.shipmentStatus = get(shipment, "status");
    this.roleInShipment = getRoleForShipmentObj(shipment, accountId);
    this.roleInStage = getRoleForStageObj(stage, accountId);
    this.update = update || {};
  }

  // check function:
  can({ action, data = {} }) {
    this.multiCheck = false;
    switch (action) {
      case "updateStage":
        this.checks = {
          role: this.roleInShipment.isOwner,
          shipmentStatus: checkShipmentStatus.call(
            this,
            ["draft", "planned", "started", "completed", "partial"], // not cancelled
            this.shipmentStatus
          ),
          userRole: this.checkUserHasRoles(["core-shipment-stage-update"]),
          fields: checkUpdateFields.call(
            this,
            [
              "dates",
              "equipment",
              "mode",
              "status",
              "drivingDistance",
              "drivingDuration",
              "sphericalDistance",
              "carrierId", // manual override carrier
              "from",
              "to"
            ],
            Object.keys(this.update)
          )
        };
        break;
      case "splitStage":
        this.checks = {
          role: this.roleInShipment.isOwner || this.roleInStage.isCarrier,
          shipmentStatus: checkShipmentStatus.call(
            this,
            ["draft", "started", "completed", "partial"],
            this.shipmentStatus
          ),
          stageStatus: checkStageStatus.call(this, ["draft"], this.stageStatus),
          userRole: this.checkUserHasRoles(["core-shipment-stage-update"])
        };
        break;

      case "setStatus":
        this.checks = {
          role: this.roleInShipment.isOwner || this.roleInStage.isCarrier,

          // checkStageStatus.call(this, ["draft"], this.stageStatus),
          userRole: this.checkUserHasRoles(["core-shipment-stage-setStatus"])
        };
        break;
      case "allocateStage":
        this.checks = {
          role: this.roleInShipment.isOwner || this.roleInStage.isCarrier,
          stageStatus: checkStageStatus.call(this, ["draft"], this.stageStatus),
          userRole: this.checkUserHasRoles(["core-shipment-stage-allocate"])
        };
        break;
      case "confirmStage":
        this.checks = {
          role: this.roleInStage.isCarrier || this.roleInShipment.isOwner,
          stageStatus: checkStageStatus.call(
            this,
            ["planned", "started"],
            this.stageStatus
          ),
          userRole: this.checkUserHasRoles(["core-shipment-stage-update"])
        };
        break;
      case "canRelease":
        this.checks = {
          role: this.roleInShipment.isOwner,
          status: checkStageStatus.call(this, ["draft"], this.stageStatus),
          userRole: this.checkUserHasRoles(["core-shipment-stage-update"])
        };
        break;
      case "canSchedule":
        // re-scheduling is allowed while the shipment is started
        this.checks = {
          carrierCondition: {
            role: this.roleInStage.isCarrier,
            stageStatus: checkStageStatus.call(
              this,
              ["draft", "planned", "started"],
              this.stageStatus
            ),
            userRole: this.checkUserHasRoles(["core-shipment-stage-update"])
          },
          ownerCondition: {
            role: this.roleInShipment.isOwner,
            hasCarrier: !!this.stage.carrierId,
            stageStatus: checkStageStatus.call(
              this,
              ["draft", "planned", "started"],
              this.stageStatus
            ),
            userRole: this.checkUserHasRoles(["core-shipment-stage-update"])
          }
        };
        this.multiCheck = true;
        break;
      case "modifyPlannedDates":
        this.checks = {
          role: this.roleInShipment.isActiveStakeholder,
          stageStatus: checkStageStatus.call(this, ["draft"], this.stageStatus),
          userRole: this.checkUserHasRoles(["core-shipment-stage-update"])
        };
        break;
      case "changeMode":
        this.checks = {
          role: this.roleInShipment.isActiveStakeholder,
          stageStatus: checkStageStatus.call(this, ["draft"], this.stageStatus),
          userRole: this.checkUserHasRoles(["core-shipment-stage-update"])
        };
        break;
      case "changeCarrier": {
        const stageCount = data.count || 1;
        this.checks = {
          role: this.roleInShipment.isOwner || this.roleInShipment.isShipper,
          stageStatus: checkStageStatus.call(this, ["draft"], this.stageStatus),
          userRole: this.checkUserHasRoles(["core-shipment-stage-update"]),
          isAlreadyAssigned: !!this.stage.carrierId,
          shipmentHasMoreThanOneStage: stageCount > 1
        };
        break;
      }
      case "viewAssignedCarrier": {
        this.checks = {
          ownerCondition: {
            role: this.roleInShipment.isOwner
          },
          partnerCondition: {
            role: !this.roleInShipment.isOwner,
            stageStatus: checkStageStatus.call(
              this,
              ["planned", "started", "completed"],
              this.stageStatus
            )
          }
        };
        this.multiCheck = true;
        break;
      }
      case "assignDriver":
        this.checks = {
          role: this.roleInStage.isCarrier,
          stageStatus: checkStageStatus.call(
            this,
            ["planned", "draft"],
            this.stageStatus
          ),
          userRole: this.checkUserHasRoles(["core-shipment-stage-assign"])
        };
        break;
      case "confirmDates":
        this.checks = {
          role: this.roleInStage.isCarrier || this.roleInShipment.isOwner,
          stageStatus: checkStageStatus.call(
            this,
            ["planned", "started"],
            this.stageStatus
          ),
          userRole: this.checkUserHasRoles(["core-shipment-stage-update"])
        };
        break;
      case "putBackToPlanned":
        // stage is completed but we need to modify something -> put back to planned status
        this.checks = {
          role: this.roleInStage.isCarrier || this.roleInShipment.isCarrier,
          status: checkStageStatus.call(this, ["completed"], this.stageStatus),
          userRole: this.checkUserHasRoles(["core-shipment-stage-update"])
        };
        break;
      case "putBackToDraft":
        this.checks = {
          plannerCheck: {
            role: this.roleInShipment.isOwner, // previously also carrier...
            status: checkStageStatus.call(
              this,
              ["planned", "started"],
              this.stageStatus
            ),
            userRole: this.checkUserHasRoles(["core-shipment-stage-update"])
          },
          adminCheck: {
            role: this.roleInShipment.isOwner, // previously also carrier...
            userRole: this.checkUserHasRoles(["admin"]),
            status: checkStageStatus.call(
              this,
              ["planned", "started", "completed", "canceled"],
              this.stageStatus
            )
          }
        };
        this.multiCheck = true;
        break;
      case "changeAddress": {
        this.checks = {
          role: this.roleInShipment.isOwner,
          stageStatus: checkStageStatus.call(this, ["draft"], this.stageStatus),
          shipmentStatus: checkShipmentStatus.call(
            this,
            ["draft"],
            this.shipmentStatus
          ),
          userRole: this.checkUserHasRoles(["core-shipment-stage-update"])
        };
        break;
      }
      case "mergeStages": {
        // extra data needs to be passed in: {data: {nextStage: {}}};
        this.nextStage = data.nextStage || {};

        this.checks = {
          isOwner: this.roleInShipment.isOwner,
          stageStatus: checkStageStatus.call(this, ["draft"], this.stageStatus),
          nextStageStatus: checkStageStatus.call(
            this,
            ["draft"],
            this.nextStage.status
          ),
          userRole: this.checkUserHasRoles(["core-shipment-stage-update"])
        };
        break;
      }
      default:
        this.allowed = false;
    }

    this.checkAllowed();
    return this;
  }
}

export { CheckStageSecurity };
