import { Roles } from "/imports/api/roles/Roles";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import {
  CheckAccountSecurity,
  fields
} from "/imports/utils/security/checkUserPermissionsForAccount";

import { getUserEntities } from "/imports/api/users/services/_roleFn";

const debug = require("debug")("resolvers:accounts");

export const updateUserEntities = ({ accountId, userId }) => ({
  accountId,
  userId,
  context: { accountId, userId },
  async get({ userIdToAlter, entity, remove }) {
    debug("userUpdate", { userIdToAlter, entity, remove });
    this.userIdToAlter = userIdToAlter;
    this.entity = entity;
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
        data: { userId: userIdToAlter, remove }
      })
      .throw();
    return this;
  },
  async update() {
    if (this.remove) {
      await Roles.removeUsersFromRoles(
        this.userIdToAlter,
        "user",
        `entity-${this.accountId}-${this.entity}`
      );
    } else {
      await Roles.addUsersToRoles(
        this.userIdToAlter,
        "user",
        `entity-${this.accountId}-${this.entity}`
      );
    }
    return this;
  },
  async getResponse() {
    const entities = await getUserEntities(this.userIdToAlter, this.accountId);

    return {
      id: this.userIdToAlter,
      entities
    };
  }
});
