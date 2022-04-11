import { Roles } from "/imports/api/roles/Roles";
import { User } from "/imports/api/users/User.js";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import {
  CheckAccountSecurity,
  fields
} from "/imports/utils/security/checkUserPermissionsForAccount";
import { getAccountUsers } from "./query.getAccountUsers";

export const removeUserFromAccount = ({ accountId, userId }) => ({
  accountId,
  userId,
  context: { accountId, userId },
  async get({ userId: userIdToRemove }) {
    this.account = await AllAccounts.first(this.accountId, { fields });
    this.user = await User.profile(userIdToRemove);
    this.userIdToRemove = userIdToRemove;
    return this;
  },
  async runChecks() {
    if (!this.user) throw new Error("User not found");
    const check = new CheckAccountSecurity(
      {
        account: this.account
      },
      this.context
    );
    await check.getUserRoles();
    check
      .can({ action: "canRemoveUsers", data: { userId: this.userIdToRemove } })
      .throw();

    return this;
  },
  async remove() {
    await Roles.setUserRoles(
      this.userIdToRemove,
      [],
      `account-${this.accountId}`
    );
    await this.account.pull({ userIds: this.userIdToRemove });
    await this.user.update_async({ deleted: true });
    return this;
  },
  getUIResponse() {
    return getAccountUsers(this.context).getUsers();
  }
});
