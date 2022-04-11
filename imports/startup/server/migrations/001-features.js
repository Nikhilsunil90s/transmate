/* eslint-disable */
import { Carrier } from "/imports/api/carriers/Carrier.js";

import { Shipper } from "/imports/api/shippers/Shipper.js";

Migrations.add({
  version: 1,
  name: "Activate the features for all existing accounts.",
  up() {
    let features;
    features = [
      "invoice-check",
      "price-list-create",
      "price-list-request",
      "price-list-share",
      "price-lookup"
    ];
    Carrier.all().forEach(function(carrier) {
      return carrier.update({ features });
    });
    return Shipper.all().forEach(function(shipper) {
      return shipper.update({ features });
    });
  }
});
