import { Meteor } from "meteor/meteor";
import { Import } from "/imports/api/imports/Import-shipments.js";

// const debug = require("debug")("publication:import-publish");

// eslint-disable-next-line func-names
Meteor.publish("import", function publish(importId) {
  check(importId, String);
  if (!this.userId) {
    return this.ready();
  }
  return Import.find(importId);
});
