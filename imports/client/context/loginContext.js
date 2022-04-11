import React from "react";
import { getType } from "/imports/api/allAccounts/services/getAccountType";
import { setUser as sentrySetUser } from "@sentry/react";

const debug = require("debug")("login:context");

// context: {account, accountId, user, userId, roles, entities}
/** @returns {{account: any, accountId: string; user: any; userId: string; roles: Array<string>; entities: Array<string>, isAdmin: boolean}} */
export const providerContext = ({ account = {}, currentUser = {} }) => {
  sentrySetUser({
    id: currentUser?.id,
    username: currentUser?.name,
    accountId: account?.id,
    accountName: account?.name,
    entities: currentUser?.entities
  });

  return {
    account: {
      ...account,
      hasFeature(feature) {
        debug("check if account has feature", feature);
        return (account?.features || []).includes(feature);
      },
      getType() {
        debug("return account type", account?.id);
        return getType({ accountId: account?.id });
      }
    },
    accountId: account?.id,
    user: currentUser,
    userId: currentUser?.id,
    roles: currentUser?.roles || [],
    entities: currentUser?.entities || [],
    isAdmin: (currentUser?.roles || []).includes("admin")
  };
};
const LoginContext = React.createContext(providerContext({}));

export const LoginProvider = LoginContext.Provider;
export default LoginContext;
