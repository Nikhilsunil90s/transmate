/* eslint-disable no-undef */

import { TenderDetail } from "/imports/api/tenders/TenderDetail";

Migrations.add({
  version: 24,
  name: "add delete=false flag to collections for quicker lookup",
  up: () => {
    TenderDetail._collection.direct.update(
      { deleted: { $exists: false } },
      { $set: { deleted: false } },
      { multi: true, bypassCollection2: true }
    );
  }
});
