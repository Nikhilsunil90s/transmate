import { CheckAddressSecurity } from "/imports/utils/security/checkUserPermissionsForAddress";

export function initializeSecurity({ address, context = {} }) {
  const { userId, accountId } = context;
  const srv = new CheckAddressSecurity(
    { address },
    { userId, accountId }
  ).setContext(context); // userId, accountId, roles;
  return {
    canEdit: srv.can({ action: "updateAddress" }).check(),
    canDelete: srv.can({ action: "removeAddress" }).check(),
    canOverride: srv.can({ action: "overrideAddress" }).check()
  };
}
