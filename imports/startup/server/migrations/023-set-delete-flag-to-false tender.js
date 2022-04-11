/* eslint-disable no-undef */

import { Tender } from "/imports/api/tenders/Tender";

Migrations.add({
  version: 23,
  name: "add delete=false flag to collections for quicker lookup",
  up: () => {
    Tender._collection.direct.update(
      { deleted: { $exists: false } },
      { $set: { deleted: false } },
      { multi: true, bypassCollection2: true }
    );
  }
});
