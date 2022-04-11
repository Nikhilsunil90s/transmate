import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { User } from "../User";

export const getUsersForAccount = ({ accountId }) => ({
  accountId, // accountId of the caller
  /**
   *
   * @param {String} accountId
   * @param {[String]} roles
   */
  async get({ accountId: usersAccountId, roles }) {
    const users = await AllAccounts.getUsers_async(usersAccountId, roles);
    return users.map(user => {
      const userDoc = User.init(user);
      return {
        ...user,
        email: userDoc.getEmail(),
        name: userDoc.getName(),
        avatar: userDoc.avatar()
      };
    });
  }
});
