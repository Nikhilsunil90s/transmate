/* eslint-disable no-undef */

import { PriceList } from "/imports/api/pricelists/PriceList";

Migrations.add({
  version: 26,
  name: "add delete=true flag to collections for quicker lookup",
  up: () => {
    PriceList._collection.direct.update(
      { "deleted.by": { $exists: true } },
      { $set: { deleted: true } },
      { multi: true, bypassCollection2: true }
    );
  }
});
