import { CheckShipmentSecurity } from "/imports/utils/security/checkUserPermissionForShipment";
import { costDetailType } from "/imports/api/shipments/interfaces/costDetail.type";

type costTableSecurity = {
  canViewCostLabel: (cost: costDetailType) => boolean;
  canApproveDecline: (cost: costDetailType) => boolean;
  canRemoveManualCost: (cost: costDetailType) => boolean;
};

export const initSecurity = ({ shipment, context }): costTableSecurity => {
  const { accountId, userId } = context;
  const srv = new CheckShipmentSecurity({ shipment }, { accountId, userId });
  srv.setContext(context);

  return {
    canViewCostLabel: (cost: costDetailType): boolean =>
      srv.can({ action: "seeApprovedDeclinedLabel", data: { cost } }).check(),
    canApproveDecline: (cost: costDetailType): boolean =>
      srv.can({ action: "approveDeclineCost", data: { cost } }).check(),
    canRemoveManualCost: (cost: costDetailType): boolean =>
      srv.can({ action: "removeManualCost", data: { cost } }).check()
  };
};
