/* global Migrations */

import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";

Migrations.add({
  version: 32,
  name: "Store userIds in account document",
  // eslint-disable-next-line consistent-return
  up: () => {
    const bulkAccountsOp = AllAccounts._collection
      .rawCollection()
      .initializeUnorderedBulkOp();
    bulkAccountsOp.executeAsync = Meteor.wrapAsync(bulkAccountsOp.execute);
    let count = 0;
    AllAccounts._collection
      .aggregate([
        { $match: { deleted: false } },
        { $project: { name: 1 } },
        {
          $lookup: {
            from: "role-assignment",
            let: { accountId: { $concat: ["account-", "$_id"] } },
            pipeline: [
              { $match: { $expr: { $eq: ["$scope", "$$accountId"] } } },
              {
                $group: {
                  _id: null,
                  ids: { $addToSet: "$user._id" }
                }
              }
            ],
            as: "userIds"
          }
        },
        { $unwind: { path: "$userIds", preserveNullAndEmptyArrays: true } },
        { $addFields: { userIds: { $ifNull: ["$userIds.ids", []] } } },
        { $addFields: { userCount: { $size: "$userIds" } } },
        { $match: { userCount: { $gt: 0 } } }
      ])
      .forEach(doc => {
        count += 1;

        // update the account document with the userId in it:
        bulkAccountsOp
          .find({ _id: doc._id })
          .update({ $set: { userIds: doc.userIds } });
      });
    if (count > 0) bulkAccountsOp.execute();

    // return `updated ${res.nInserted} accounts`;
    return `updated accounts`;
  }
});
