/* eslint-disable */
import { Carrier } from "/imports/api/carriers/Carrier.js";

import { Shipper } from "/imports/api/shippers/Shipper.js";

Migrations.add({
  version: 4,
  name: "Activate new features for all existing accounts.",
  up() {
    let features;
    features = ["price-list", "price-analysis", "tender"];
    return features.forEach(function(feature) {
      Carrier._collection.update(
        {},
        {
          $push: {
            features: feature
          }
        },
        {
          multi: true
        }
      );
      return Shipper._collection.update(
        {},
        {
          $push: {
            features: feature
          }
        },
        {
          multi: true
        }
      );
    });
  }
});
