/* eslint-disable no-undef */

import { Shipment } from "/imports/api/shipments/Shipment";

Migrations.add({
  version: 19,
  name: "add delete=false flag to collections for quicker lookup",
  up: () => {
    Shipment._collection.direct.update(
      { deleted: { $exists: false } },
      { $set: { deleted: false } },
      { multi: true, bypassCollection2: true }
    );
  }
});
