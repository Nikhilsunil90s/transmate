import { CheckProjectSecurity } from "/imports/utils/security/checkUserPermissionForProject";

export const initializeSecurity = ({ project, context }) => {
  const { userId, accountId } = context;
  const check = new CheckProjectSecurity({ project }, { userId, accountId });
  check.setContext(context);

  return {
    canRemoveProject: check.can({ action: "removeProject" }).check()
  };
};
