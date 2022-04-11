import { Roles } from "/imports/api/roles/Roles";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { toast } from "react-toastify";

import { generatePath } from "react-router";
import { oPath } from "../../utils/functions/path";
import { AccountsTemplates } from "./AccountsTemplatesPlaceHolder";

const debug = require("debug")("routes:helper");

const routesMap = {};
let currentRoute = null;

// eslint-disable-next-line consistent-return
export const mustBeLoggedIn = function mustBeLoggedIn(request, redirect) {
  const { path } = request;
  const isLoggedIn = Meteor.userId();
  const isUnverified = !!(
    Meteor.user() && !oPath([0, "verified"], Meteor.user().emails)
  );

  // debug("login status %o", { isLoggedIn, isUnverified });

  // TODO [$6130a08837762e00094fd3db]:
  const isLoginPage = AccountsTemplates.knownRoutes.includes(path);

  if (!isLoggedIn || isUnverified) {
    if (!isLoginPage) {
      AccountsTemplates.avoidRedirect = true;
      AccountsTemplates.avoidClearError = true;
      AccountsTemplates.redirectToPrevPath = true;
      if (isUnverified) {
        debug("loginRedirect: redirect to signUp");
        toast.error(
          `Not able to redirect to Dashboard, user verification is not yet finished!`
        );

        return redirect("signUp");
      }
      // eslint-disable-next-line meteor/no-session
      Session.set("loginRedirect", path);
      debug("loginRedirect: redirect to signin %o", request);

      return redirect("signIn");
    }
  }

  return true;
};

export const mustBeAdmin = function mustBeAdmin(request, redirect) {
  const isLoggedIn = !!Meteor.userId();
  const isAdmin = Roles.userIsInRole(
    Meteor.userId(),
    ["admin"],
    Roles.GLOBAL_GROUP
  );
  if (!(isLoggedIn && isAdmin)) {
    debug("mustBeAdmin, redirect to dashboard!");

    redirect("dashboard");
  }
};

export const generateRoutePath = (name, params) => {
  const pattern = routesMap[name];
  const path = generatePath(pattern, params);

  return path;
};

export const regiterPath = (name, path) => {
  if (!name || !path) {
    return;
  }
  routesMap[name] = path;
};

export const goRoute = (history, name, params) => {
  const url = generateRoutePath(name, params);
  history.push(url);
};

export const setCurrentRoute = route => {
  currentRoute = route;
};

export const getCurrentRoute = () => {
  if (!currentRoute) {
    return null;
  }
  const path = routesMap[currentRoute];

  return { name: currentRoute, path };
};
