import { Meteor } from "meteor/meteor";

import { Tracker } from "meteor/tracker";

Tracker.autorun(function tracker(handle) {
  // Wait until the user data is ready — we need this to determine if the user
  // has verified his/her email address
  if (Meteor.user() !== undefined) {
    handle.stop();
  }
});
