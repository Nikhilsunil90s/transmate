/* eslint-disable */
import { PriceListRateSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/price-list-rate.js";

import { PriceList } from "/imports/api/pricelists/PriceList.js";

Migrations.add({
  version: 5,
  name: "Split rates from the price list collection",
  up() {
    // 1. lookup pricelists V2
    // 2. for each rate item -> create new document (referencing the priceListId)
    // 3. remove the rates array from the priceList document
    const priceLists = PriceList.find(
      {
        uoms: {
          $exists: true
        },
        rates: {
          $exists: true
        }
      },
      {
        fields: {
          rates: 1
        }
      }
    );
    return priceLists.forEach(priceList => {
      priceList.rates.forEach(rate => {
        Object.assign(rate, {
          priceListId: priceList._id
        });
        if (Match.test(rate, PriceListRateSchema)) {
          return PriceListRate._collection.insert(rate);
        }
      });
      return priceList.del("rates");
    });
  }
});
