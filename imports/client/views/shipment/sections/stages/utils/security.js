import get from "lodash.get";
import { CheckStageSecurity } from "/imports/utils/security/checkUserPermissionsForStage";

const debug = require("debug")("shipment:stage");

function checkIsReadyForRelease(stage, shipment) {
  const problems = [];

  if (stage.status !== "draft") {
    problems.push("status");
  }
  if (!shipment.shipperId) {
    problems.push("shipper");
  }
  if (!shipment.hasItems) {
    problems.push("items");
  }
  if (!(stage.from && stage.to)) {
    problems.push("fields");
    problems.push("fields - from & to");
  }
  if (!stage.carrierId) {
    problems.push("carrierId");
  }
  if (
    !(
      get(stage, ["dates", "pickup", "arrival", "planned"]) &&
      get(stage, ["dates", "delivery", "arrival", "planned"])
    )
  ) {
    problems.push("fields");
    problems.push("fields - dates");
  }
  return { problems, pass: problems.length === 0 };
}

export const runSecurityChecks = ({
  stage,
  shipment,
  stages = [],
  context = {}
}) => {
  const { userId, accountId } = context;

  const checkStageSecurityFn = (action, data) => {
    return new CheckStageSecurity({ stage, shipment }, { userId, accountId })
      .setContext(context) // userId, accountId, roles
      .can({ action, data })
      .check();
  };

  const nextStage = stages.find(x => x.sequence === stage.sequence + 1);
  const count = stages.length;
  const { pass, problems: releaseProblems } = checkIsReadyForRelease(
    stage,
    shipment
  );

  const checks = {
    canChangeAddress: checkStageSecurityFn("changeAddress"),
    canViewAssignedCarrier: checkStageSecurityFn("viewAssignedCarrier"),
    canAssignDriver: checkStageSecurityFn("assignDriver"),
    canChangeMode: checkStageSecurityFn("changeMode"),
    canChangeCarrier: checkStageSecurityFn("changeCarrier", { count }),
    canModifyPlannedDates: checkStageSecurityFn("modifyPlannedDates"),

    canPutBackToDraft: checkStageSecurityFn("putBackToDraft"),
    canPutStageToPlanned: checkStageSecurityFn("putBackToPlanned"),
    canConfirmDates: checkStageSecurityFn("confirmDates"),
    canRelease: checkStageSecurityFn("canRelease"),
    stageReadyForRelease: pass,

    // true if ok:
    stageReleaseAudit: {
      fields: !releaseProblems.includes("fields"),
      items: !releaseProblems.includes("items"),
      shipper: !releaseProblems.includes("shipper"),
      carrier: !releaseProblems.includes("carrierId")
    },
    canSchedule: checkStageSecurityFn("canSchedule"),
    canSplitStage: checkStageSecurityFn("splitStage"),
    canMergeStage: checkStageSecurityFn("mergeStages", { nextStage })
  };

  debug("runSecurityChecks %o", { checks });
  return checks;
};
