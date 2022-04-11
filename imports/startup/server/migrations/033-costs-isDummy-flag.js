/* global Migrations */

import { Cost } from "/imports/api/costs/Cost";

Migrations.add({
  version: 33,
  name: "add isDummy flag for filtering",
  // eslint-disable-next-line consistent-return
  up: () => {
    Cost._collection
      .rawCollection()
      .update({ type: "dummy" }, { $set: { isDummy: true } }, { multi: true });

    Cost._collection
      .rawCollection()
      .update(
        { type: { $ne: "dummy" } },
        { $set: { isDummy: false } },
        { multi: true }
      );
  }
});
