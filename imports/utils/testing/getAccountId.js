/* global Roles */
import { _ } from "meteor/underscore";

const startsWith = require("underscore.string/startsWith");

export const getAccountId = userId => {
  const account = _.find(Roles.getScopesForUser(userId), group => {
    return startsWith(group, "account-");
  });
  if (account) {
    return account.replace("account-", "");
  }
  return undefined;
};
