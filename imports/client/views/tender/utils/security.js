import { CheckTenderSecurity } from "/imports/utils/security/checkUserPermissionsForTender";

export function initializeSecurity({ tender, context = {} }) {
  const { userId, accountId } = context;
  const srv = new CheckTenderSecurity({ tender }, { userId, accountId })
    .setContext(context)
    .init();
  return {
    isOwner: srv.role?.isOwner,
    isBidder: srv.role?.isBidder,
    userRole: srv.role?.userRole,

    canEditGeneral: srv.can({ action: "editGeneral" }).check(),
    canEditTenderFaq: srv.can({ action: "editTenderFaq" }).check(),
    isOwnerOrManager: srv.can({ action: "isOwnerOrManager" }).check(),

    canEditContacts: srv.can({ action: "editContacts" }).check(),
    canPlaceBid: srv.can({ action: "placeBid" }).check(),
    canEditRequirement: srv.can({ action: "editRequirement" }).check(),
    canModifyTenderSettings: srv.can({ action: "modifyTenderSetting" }).check(),
    canEditPartners: srv.can({ action: "editPartners" }).check(),

    canEditScope: srv.can({ action: "editScope" }).check(),
    canGeneratePackages: srv.can({ action: "generatePackages" }).check(),

    // footer:
    canRelease: srv.can({ action: "canRelease" }).check(),
    canSetBackToDraft: srv.can({ action: "canSetBackToDraft" }).check(),
    canSetToReview: srv.can({ action: "canSetToReview" }).check(),
    canBeClosed: srv.can({ action: "canBeClosed" }).check(),
    canBeCanceled: srv.can({ action: "canBeCanceled" }).check()
  };
}
