/* eslint-disable no-undef */

import { Invoice } from "/imports/api/invoices/Invoice";

Migrations.add({
  version: 20,
  name: "add delete=false flag to collections for quicker lookup",
  up: () => {
    Invoice._collection.direct.update(
      { deleted: { $exists: false } },
      { $set: { deleted: false } },
      { multi: true, bypassCollection2: true }
    );
  }
});
