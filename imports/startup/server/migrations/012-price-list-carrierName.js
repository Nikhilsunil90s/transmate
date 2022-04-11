/* eslint-disable */
import { PriceList } from "/imports/api/pricelists/PriceList.js";
import { Carrier } from "/imports/api/carriers/Carrier.js";

Migrations.add({
  version: 12,
  name: "add carrierName to pricelist",
  up: () => {
    PriceList._collection
      .find({
        carrierName: {
          $exists: false
        }
      })
      .forEach(doc => {
        const carrier = Carrier._collection.findOne(
          {
            _id: doc.carrierId
          },
          {
            name: 1
          }
        );
        if (carrier) {
          PriceList._collection.rawCollection().update(
            {
              _id: doc._id
            },
            {
              $set: {
                carrierName: carrier.name
              }
            },
            {
              bypassCollection2: true
            }
          );
        }
      });
  }
});
