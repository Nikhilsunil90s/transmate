import { User } from "/imports/api/users/User.js";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import {
  getRolesForUsers,
  listRoles,
  getEntitiesForUsers,
  listEntities
} from "/imports/api/users/services/_roleFn";
import { pipelineBuilder } from "./_pipelineBuilder";

export const getAccountUsers = ({ accountId, userId }) => ({
  accountId,
  userId,
  context: { accountId, userId },
  async getUsers() {
    const srv = pipelineBuilder(this.context)
      .find({ fields: { userIds: 1 } })
      .getUsers()
      .getUserBaseRoles()
      .getUserEntities();
    await srv.fetchOne(); // also returns account
    srv.postProcessMergeUserAndRoles();
    return srv.get();
  },

  // old code:
  async get() {
    const account = await AllAccounts.first(this.accountId, {
      fields: { userIds: 1 }
    });
    const { userIds = [] } = account;

    const [users, roles, entities] = await Promise.all([
      User.where(
        { _id: { $in: userIds }, deleted: { $ne: true } },
        { fields: { profile: 1, emails: 1 } }
      ),
      getRolesForUsers(userIds, this.accountId),
      getEntitiesForUsers(userIds, accountId)
    ]);

    const userRes = users.map(({ _id: id, ...userInfo }) => ({
      id,
      ...userInfo,
      baseRoles: listRoles(id, roles, true), // unique roles in an array
      entities: listEntities(id, accountId, entities) // unique entities in an array
    }));

    return userRes;
  }
});
