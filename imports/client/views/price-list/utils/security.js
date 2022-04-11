import { CheckPriceListSecurity } from "/imports/utils/security/checkUserPermissionsForPriceList";

const debug = require("debug")("priceList:main");

export function initializeSecurity({ priceList }, { accountId, userId }) {
  const srv = new CheckPriceListSecurity({ priceList }, { accountId, userId });

  const security = {
    // isOwner: srv.role?.isOwner,
    // isBidder: srv.role?.isBidder,
    // userRole: srv.role?.userRole,

    canEdit: srv.can({ action: "canEdit" }).check(),
    canModifyGridStructure: srv
      .can({ action: "canModifyGridStructure" })
      .check(),
    canAddFuelModel: srv.can({ action: "canAddFuelModel" }).check(),
    canModifyLeadTime: srv.can({ action: "canModifyLeadTime" }).check(),
    canAddMasterNotes: srv.can({ action: "canAddMasterNotes" }).check(),
    canAddAttachment: srv.can({ action: "addAttachment" }).check(),
    canDeleteAttachment: srv.can({ action: "deleteAttachment" }).check(),
    canBeReleased: srv.can({ action: "canBeReleased" }).check(),
    canBeApproved: srv.can({ action: "canBeApproved" }).check(),
    canBeSetBackToDraft: srv.can({ action: "canBeSetBackToDraft" }).check(),
    canBeDeactivated: srv.can({ action: "canBeDeactivated" }).check(),
    canBeArchived: srv.can({ action: "canBeArchived" }).check(),
    canBeActivated: srv.can({ action: "canBeActivated" }).check(),
    canBeDeleted: srv.can({ action: "canBeDeleted" }).check(),

    canEditRateInGrid: srv.can({ action: "canEditRateInGrid" }).check(),
    canEditCurrencyInGrid: srv.can({ action: "canEditCurrencyInGrid" }).check(),
    canEditMultiplierInGrid: srv
      .can({ action: "canEditMultiplierInGrid" })
      .check(),
    canEditLaneInGrid: srv.can({ action: "canEditLaneInGrid" }).check(),
    canEditEquipmentInGrid: srv
      .can({ action: "canEditEquipmentInGrid" })
      .check(),
    canEditVolumesInGrid: srv.can({ action: "canEditVolumesInGrid" }).check(),
    canEditCharge: srv.can({ action: "canEditCharge" }).check(),
    canAddGridComments: srv.can({ action: "canAddGridComments" }).check(),
    canFillOut: srv.can({ action: "fillOut" }).check(),
    canEditRateInList: srv.can({ action: "canEditRateInList" }).check(),
    canModifyConversions: srv.can({ action: "canModifyConversions" }).check()
  };

  debug("priceList security", security);
  return security;
}
