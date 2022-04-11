/* eslint-disable no-undef */

import { PriceList } from "/imports/api/pricelists/PriceList";

Migrations.add({
  version: 18,
  name: "add delete=false flag to collections for quicker lookup",
  up: () => {
    PriceList._collection.direct.update(
      { deleted: { $exists: false } },
      { $set: { deleted: false } },
      { multi: true, bypassCollection2: true }
    );
  }
});
