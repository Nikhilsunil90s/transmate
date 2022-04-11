import { CheckAccountSecurity } from "/imports/utils/security/checkUserPermissionsForAccount";

export const initializeSecurity = ({ context, fuelAccountId }) => {
  const srv = new CheckAccountSecurity({}, context);
  srv.setContext(context);
  return srv
    .can({
      action: "canEditFuelModel",
      data: { fuelAccountId }
    })
    .check();
};
