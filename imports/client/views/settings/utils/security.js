import { CheckAccountSecurity } from "/imports/utils/security/checkUserPermissionsForAccount";

export const initializeSecurity = ({ account, context }) => {
  const { accountId, userId } = context;
  const srv = new CheckAccountSecurity({ account }, { accountId, userId });
  srv.setContext(context);
  return {
    canEditUsers: srv.can({ action: "canEditUsers" }).check(),
    canAddUsers: srv.can({ action: "canAddUsers" }).check(),
    canRemoveUsers: srv.can({ action: "canRemoveUsers" }).check(),
    canEditAccountPortal: srv.can({ action: "canEditAccountPortal" }).check(),

    // FIXME: fuel should be checked against accountId of the fuel index itself:
    canEditFuelModel: srv
      .can({
        action: "canEditFuelModel",
        data: { fuelAccountId: context.accountId }
      })
      .check(),
    canEditEntities: srv.can({ action: "canEditEntities" }).check(),
    canEditProjects: srv.can({ action: "canEditMasterData" }).check()
  };
};
