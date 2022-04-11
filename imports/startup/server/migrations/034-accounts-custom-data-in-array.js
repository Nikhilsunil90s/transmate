/* global Migrations */

import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";

Migrations.add({
  version: 34,
  name:
    "set account specific data in array instead of object with variable key",
  up: () => {
    const bulkOp = AllAccounts._collection
      .rawCollection()
      .initializeOrderedBulkOp();
    bulkOp.executeAsync = Meteor.wrapAsync(bulkOp.execute);
    let count = 0;
    AllAccounts.find({ account: { $exists: true } }).forEach(doc => {
      count += 1;
      const { account } = doc;
      const accounts = [];
      Object.entries(account).forEach(([accountId, v]) => {
        const { ediId, ...data } = v || {};
        accounts.push({
          accountId,
          ...data,
          coding: { ediId }
        });
      });
      if (count > 0)
        bulkOp.find({ _id: doc._id }).updateOne({ $set: { accounts } });
    });
    try {
      bulkOp.execute();
    } catch (e) {
      console.error("no account date to update");
    }
  }
});
