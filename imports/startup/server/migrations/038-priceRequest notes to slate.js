/* global Migrations */
import { PriceRequest } from "/imports/api/priceRequest/PriceRequest";

Migrations.add({
  version: 38,
  name: "priceRequest notes to slate",
  // eslint-disable-next-line consistent-return
  up: () => {
    let count = 0;
    const bulkOp = PriceRequest._collection
      .rawCollection()
      .initializeOrderedBulkOp();
    bulkOp.executeAsync = Meteor.wrapAsync(bulkOp.execute);

    PriceRequest._collection.find({ notes: { $exists: true } }).forEach(doc => {
      count += 1;
      const { notes: text } = doc;

      // slate is a stringified object:
      const notes = JSON.stringify([{ children: [{ text }] }]);
      bulkOp.find({ _id: doc._id }).updateOne({ $set: { notes } });
    });

    if (count > 0) bulkOp.execute();
  }
});
