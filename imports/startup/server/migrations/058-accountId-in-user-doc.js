/* global Migrations */
import { RolesAssignment } from "/imports/api/roles/RolesAssignment";
import { User } from "/imports/api/users/User";

Migrations.add({
  version: 58,
  name: "add accountId in userDocument",
  // eslint-disable-next-line consistent-return
  up: async () => {
    const accountAssignment = await RolesAssignment.aggregate(
      { $match: { scope: /^account-/ } },
      { $group: { _id: "$user._id", scopes: { $addToSet: "$scope" } } }
    );

    const bulkOp = User._collection.rawCollection().initializeOrderedBulkOp();
    accountAssignment.forEach(({ _id: userId, scopes }) => {
      const accountIds = scopes.map(scopeString =>
        scopeString.replace("account-", "")
      );
      bulkOp.find({ _id: userId }).updateOne({ $set: { accountIds } });
    });
    if (accountAssignment.length) {
      try {
        await bulkOp.execute();
      } catch (e) {
        console.error(e);
      }
    }
    return true;
  }
});

// run manually on nosqlbooster
// db.users.find({ accountIds: null }).project({ _id: 1 })
//     .forEach(user => {
//         const roles = db.getCollection("role-assignment").find({ scope: /^account-/, "user._id": user._id }).project({ scope: 1 }).toArray();
//         const accountIds = roles.map(role =>
//             role.scope.replace("account-", "")
//         );
//         console.log("update user ", user._id, "with accountIds", accountIds);
//         db.users.update({ _id: user._id }, { $set: { accountIds } });
//     })
