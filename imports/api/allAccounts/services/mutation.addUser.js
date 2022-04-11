import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { createUserService } from "/imports/api/users/services/createUserSrv";
import { CheckAccountSecurity } from "/imports/utils/security/checkUserPermissionsForAccount";
import { getAccountUsers } from "./query.getAccountUsers";

export const addUserToAccount = ({ accountId, userId }) => ({
  accountId,
  userId,
  context: { accountId, userId },
  async get() {
    this.account = await AllAccounts.first(this.accountId);
    const check = new CheckAccountSecurity(
      {
        account: this.account
      },
      this.context
    );
    await check.getUserRoles();
    check.can({ action: "canAddUsers" }).throw();
    return this;
  },
  async add({ user: { email, first, last }, options }) {
    // move some keys:
    const usr = {
      email,
      firstName: first,
      lastName: last
    };

    this.createdUserId = await createUserService({
      user: usr,
      accountId: this.accountId,
      options
    }).getUserId();
    return this;
  },
  getResponse() {
    return getAccountUsers(this.context).getUsers();
  }
});
