import { CheckAnalysisSecurity } from "/imports/utils/security/checkUserPermissionsForAnalysis";

export function initializeSecurity({ analysis, accountId, userId }) {
  const srv = new CheckAnalysisSecurity({ analysis }, { accountId, userId });
  return {
    isOwner: srv.role?.isOwner,
    isBidder: srv.role?.isBidder,
    userRole: srv.role?.userRole
  };
}
