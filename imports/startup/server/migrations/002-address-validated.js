/* eslint-disable */
import { Address } from "/imports/api/addresses/Address.js";

Migrations.add({
  version: 2,
  name: "Mark all existing addresses as validated.",
  up() {
    return Address._collection.update(
      {},
      {
        $set: {
          validated: true
        }
      },
      {
        multi: true
      }
    );
  }
});
