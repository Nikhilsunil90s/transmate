/* eslint-disable no-use-before-define */
import get from "lodash.get";
import { SecurityCheck } from "./_securityCheck";

// const debug = require("debug")("security:shipment");

export const dbFields = {
  status: 1,
  planners: 1,
  accountId: 1,
  partners: 1
};

export const getRoleForProject = (project = {}, accountId) => {
  return {
    isOwner: project.accountId === accountId
  };
};

const getUserRoleForProject = (project = {}, userId) => ({
  isPlanner: !!(project.planners || []).find(({ id }) => id === userId)
});
class CheckProjectSecurity extends SecurityCheck {
  constructor({ project }, { userId, accountId }) {
    super({ userId, accountId });

    // specific here:
    this.project = project || {};
    this.status = get(project, ["status"]);
    this.role = getRoleForProject(project, accountId);
    this.userRole = getUserRoleForProject(project, userId);
  }

  can({ action }) {
    // helpers
    this.action = action;

    switch (action) {
      case "createProject": {
        this.checks = {
          userHasRole: this.checkUserHasRoles(["core-shipment-create"])
        };
        break;
      }
      case "viewCosts":
      case "editProject": {
        this.checks = {
          status: this.status === "active",
          isPlanner:
            this.userRole.isPlanner || this.checkUserHasRoles(["GLOBAL_ADMIN"])
        };
        break;
      }
      case "removeProject": {
        this.checks = {
          status: this.status === "active",
          isAdmin: this.checkUserHasRoles(["admin"]),
          isPlanner:
            this.userRole.isPlanner || this.checkUserHasRoles(["GLOBAL_ADMIN"])
        };
        break;
      }
      default:
        this.allowed = false;
    }

    this.checkAllowed();
    return this;
  }
}

export { CheckProjectSecurity };
