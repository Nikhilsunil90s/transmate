/* eslint-disable */
import { Address } from "/imports/api/addresses/Address.js";

Migrations.add({
  version: 3,
  name: "Mark all validated addresses as validated by Google.",
  up() {
    return Address._collection.update(
      {
        validated: {
          $exists: true
        }
      },
      {
        $set: {
          validated: {
            by: "google"
          }
        }
      },
      {
        multi: true
      }
    );
  }
});
