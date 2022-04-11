import { CheckPriceRequestSecurity } from "/imports/utils/security/checkUserPermissionsForRequest";

export function initializeSecurity({ priceRequest, context }) {
  const { userId, accountId } = context;
  const srv = new CheckPriceRequestSecurity(
    { request: priceRequest },
    { userId, accountId }
  ).setContext(context); // userId, accountId, roles;

  return {
    isOwner: srv.role?.isOwner,
    isBidder: srv.role?.isBidder,
    canViewPartners: srv.can({ action: "viewPartners" }).check(),
    canViewAnalytics: srv.can({ action: "viewAnalytics" }).check(),
    canBeRequested: srv.can({ action: "canBeRequested" }).check(),
    canBeRequestedChecks: srv.can({ action: "canBeRequested" }).checks, // {} with all checks
    canBeSetBackToDraft: srv.can({ action: "canBeSetBackToDraft" }).check(),
    canBeArchived: srv.can({ action: "canBeArchived" }).check(),
    canBeDeleted: srv.can({ action: "canBeDeleted" }).check(),
    canEditTitle: srv.can({ action: "editTitle" }).check(),
    canEditMasterNote: srv.can({ action: "editMasterNote" }).check(),
    canAddPartners: srv.can({ action: "addPartners" }).check(),
    canEditRequirements: srv.can({ action: "editRequirements" }).check(),
    canBidOnRequest: srv.can({ action: "bidOnRequest" }).check(),
    canPlaceBid: srv.can({ action: "placeBid" }).check(),
    canEditSettings: srv.can({ action: "editSettings" }).check(),
    canViewSettings: srv.can({ action: "viewSettings" }).check(),
    canPostponeDeadline: srv.can({ action: "postponeDeadline" }).check()
  };
}
