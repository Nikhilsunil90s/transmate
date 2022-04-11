/* global Migrations */
import get from "lodash.get";
import moment from "moment";

import { PriceRequest } from "/imports/api/priceRequest/PriceRequest";

Migrations.add({
  version: 36,
  name: "add price request title",
  // eslint-disable-next-line consistent-return
  up: () => {
    const bulkOp = PriceRequest._collection
      .rawCollection()
      .initializeOrderedBulkOp();
    bulkOp.executeAsync = Meteor.wrapAsync(bulkOp.execute);
    let count = 0;
    PriceRequest._collection
      .find({ title: { $exists: false } })
      .forEach(requestDoc => {
        count += 1;
        function getReference(doc) {
          return `${moment(get(doc, "created.at") || new Date()).format(
            "MMDD"
          )}-${doc._id.slice(-3).toUpperCase()}`;
        }
        const title = getReference(requestDoc);
        bulkOp.find({ _id: requestDoc._id }).updateOne({ $set: { title } });
      });

    if (count > 0) bulkOp.execute();
  }
});
