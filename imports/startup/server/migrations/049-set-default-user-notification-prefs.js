/* global Migrations */
import { User } from "/imports/api/users/User";
import { DEFAULT_USER_NOTIFICATION_PREFERENCES } from "/imports/api/_jsonSchemas/enums/user";

Migrations.add({
  version: 49,
  name: "Set default user preferences",
  up: () => {
    User._collection.update(
      { "preferences.notifications": { $exists: false } },
      {
        $set: {
          "preferences.notifications": DEFAULT_USER_NOTIFICATION_PREFERENCES
        }
      }
    );
  }
});
