import { CheckPartnershipSecurity } from "/imports/utils/security/checkUserPermissionsForPartnerShip.js";

export function initializeSecurity({ partner, context }) {
  const srv = new CheckPartnershipSecurity({ partner }, context).setContext(
    context
  );
  return {
    canAnnotatePartner: srv.can({ action: "canAnnotatePartner" }).check(),
    canBeDeactivated: srv.can({ action: "canBeDeactivated" }).check(),
    canAcceptRejectRequest: srv
      .can({ action: "canAcceptRejectRequest" })
      .check(),
    canResendRequest: srv.can({ action: "canResendRequest" }).check(),
    canBeReactivated: srv.can({ action: "canBeReactivated" }).check()
  };
}
