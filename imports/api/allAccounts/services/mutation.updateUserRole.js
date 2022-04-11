import { Roles } from "/imports/api/roles/Roles";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import {
  CheckAccountSecurity,
  fields
} from "/imports/utils/security/checkUserPermissionsForAccount";

import { getRolesForUser } from "/imports/api/users/services/_roleFn";

const debug = require("debug")("resolvers:accounts");

export const updateUserRoles = ({ accountId, userId }) => ({
  accountId,
  userId,
  context: { accountId, userId },
  async get({ userIdToAlter, role, remove }) {
    debug("userUpdate", { userIdToAlter, role, remove });
    this.userIdToAlter = userIdToAlter;
    this.role = role;
    this.remove = remove;

    this.account = await AllAccounts.first(this.accountId, { fields });
    const check = new CheckAccountSecurity(
      {
        account: this.account
      },
      this.context
    );
    await check.getUserRoles();
    check
      .can({
        action: "canEditUsers",
        data: { userId: userIdToAlter, role, remove }
      })
      .throw();
    return this;
  },
  async update() {
    if (this.remove) {
      await Roles.removeUsersFromRoles(
        this.userIdToAlter,
        this.role,
        `account-${this.accountId}`
      );
    } else {
      await Roles.addUsersToRoles(
        this.userIdToAlter,
        this.role,
        `account-${this.accountId}`
      );
    }
    return this;
  },
  async getResponse() {
    const roles = await getRolesForUser(
      this.userIdToAlter,
      this.accountId,
      true
    );

    return {
      id: this.userIdToAlter,
      baseRoles: roles
    };
  }
});
