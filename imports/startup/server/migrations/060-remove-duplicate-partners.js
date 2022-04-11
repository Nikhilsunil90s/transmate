/* global Migrations */
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts.js";

Migrations.add({
  version: 60,
  name: "Remove duplicate partners",
  // eslint-disable-next-line consistent-return
  up: async () => {
    const bulkAccountsOp = AllAccounts._collection
      .rawCollection()
      .initializeUnorderedBulkOp();

    bulkAccountsOp.executeAsync = Meteor.wrapAsync(bulkAccountsOp.execute);

    const cursor = AllAccounts.aggregate([
      { $unwind: "$partners" },
      {
        $group: {
          _id: {
            _id: "$_id",
            partners: "$partners.accountId"
          },
          count: { $sum: 1 }
        }
      },
      { $match: { count: { $ne: 1 } } },
      {
        $group: {
          _id: "$_id._id",
          partners: { $push: "$_id.partners" }
        }
      }
    ]);
    const batch = AllAccounts._collection
      .rawCollection()
      .initializeOrderedBulkOp();

    cursor.forEach(function(doc) {
      doc.partners.forEach(function(dup) {
        batch
          .find({
            _id: doc._id,
            partners: { $elemMatch: { accountId: dup, status: "requested" } }
          })
          .updateOne({
            $unset: { "partners.$": "" }
          });
        batch.find({ _id: doc._id }).updateOne({
          $pull: { partners: null }
        });
      });
      batch.execute();
    });
    batch.execute();
    return true;
  }
});
