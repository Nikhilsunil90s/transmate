/* eslint-disable no-undef */
import { PriceList } from "/imports/api/pricelists/PriceList.js";

Migrations.add({
  version: 13,
  name: "modify conversion structure to object in priceList",
  up: () => {
    // 1. conversion from same uom to same uom -> remove
    PriceList._collection.update(
      {
        "uoms.conversions.from.uom": { $exists: true },
        "uoms.conversions": { $size: 1 },
        $expr: {
          $eq: ["$uoms.conversions.from.uom", "$uoms.conversions.to.uom"]
        }
      },
      { $unset: { "uoms.conversions": "" } },
      { multi: true }
    );

    // 2. range = array -> make it an object
    PriceList._collection
      .find({
        "uoms.conversions.from.range": {
          $type: "array"
        }
      })
      .forEach(doc => {
        let { conversions } = doc.uoms;

        if (conversions.length) {
          conversions = conversions.filter(
            conv => conv.from.uom !== conv.to.uom
          );
          conversions = conversions.map(conv => {
            if (conv.from.range) {
              const from = conv.from.range[0];
              const to = conv.from.range[1];

              conv.from.range = { from, to };
            }
            return conv;
          });

          // as we are filtering out the kg - kg we can now have an empty []
          if (conversions.length > 0) {
            PriceList._collection.update(
              { _id: doc._id },
              { $set: { "uoms.conversions": conversions } }
            );
          } else {
            // remove the conversion if empty
            PriceList._collection.update(
              { _id: doc._id },
              { $unset: { "uoms.conversions": "" } }
            );
          }
        }
      });
  }
});
