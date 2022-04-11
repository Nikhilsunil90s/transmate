/* global Migrations */
import { Meteor } from "meteor/meteor";

import "/imports/startup/server/migrations/_imports.js";

Meteor.startup(function setMigrations() {
  Migrations.config({
    logIfLatest: false
  });

  // Run migrations (already defined in /migrations)
  return Migrations.migrateTo("latest");
});
