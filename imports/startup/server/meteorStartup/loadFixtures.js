import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { canResetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/checkServerAndFlag";

const debug = require("debug")("startup");

Meteor.startup(function loadFixtures() {
  // only in local database!!!
  // only if key is set!!

  debug("reset local database? %s", canResetCollections());
  if (canResetCollections()) {
    console.log("resetting the local database");
    resetDb();
  }
});
