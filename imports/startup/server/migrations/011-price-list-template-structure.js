/* eslint-disable */
import { PriceList } from "/imports/api/pricelists/PriceList.js";

Migrations.add({
  version: 11,
  name: "Convert price-list template to object",
  up: () => {
    PriceList._collection
      .find({ template: { $type: "string" } })
      .forEach(doc => {
        const { template } = doc;
        PriceList._collection
          .rawCollection()
          .update(
            { _id: doc._id },
            { $set: { template: { type: template } } },
            { bypassCollection2: true }
          );
      });
  }
});
