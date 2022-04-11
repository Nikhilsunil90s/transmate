import React from "react";
import ReactDOM from "react-dom";
import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";
import AppRoutes, { onAuthChange } from "./AppRoutes";

// AppRoutes
Tracker.autorun(() => {
  const authenticated = !!Meteor.userId();
  onAuthChange(authenticated);
});

Meteor.startup(() => {
  ReactDOM.render(<AppRoutes />, document.getElementById("react-root"));
});
