/* eslint-disable no-undef */

import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";

Migrations.add({
  version: 22,
  name: "add delete=false flag to collections for quicker lookup",
  up: () => {
    AllAccounts._collection.direct.update(
      { deleted: { $exists: false } },
      { $set: { deleted: false } },
      { multi: true, bypassCollection2: true }
    );
  }
});
