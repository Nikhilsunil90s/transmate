/* eslint-disable */
import { Shipment } from "/imports/api/shipments/Shipment.js";

Migrations.add({
  version: 6,
  name: "Fix empty shipment.carrierIds",
  up() {
    return Shipment.find({
      carrierIds: []
    }).forEach(function(shipment) {
      return shipment.refreshCarriers();
    });
  }
});
