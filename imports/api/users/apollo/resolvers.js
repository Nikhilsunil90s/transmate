/* eslint-disable no-underscore-dangle */
import moment from "moment";
import SecurityChecks from "/imports/utils/security/_security";
import { getUsersForAccount } from "../services/query.getUsersForAccount";
import { getContactInfo } from "../services/query.getContactInfo";
import { setApiKeyForUser } from "../services/mutation.setApiKeyForUser";
import { updateUser } from "../services/mutation.updateUser";
import { upgradeRequest } from "../services/mutation.upgradeRequest";
import { manuallySetTokenForLogin } from "../services/mutation.manuallySetTokenForLogin";
import { updateUserPreferenceByTopic } from "../services/mutation.updateUserPreferenceByTopic";
import { createUserService } from "../services/createUserSrv";

import { UserActivity } from "../UserActivity";
import { User } from "../User";
import { getRolesForUser, getUserEntities } from "../services/_roleFn";
import TokenGenerationService from "../../allAccounts/server/tokenGeneationSrv";

const debug = require("debug")("apollo:resolvers:user");

// unfortunately the helper was named the same as the value key...
const checkHelper = (key, doc) => {
  if (typeof doc[key] === "function" || !doc[key]) {
    const fn = User.init(doc)[key];
    return fn.call(doc);
  }
  return doc[key];
};

export const resolvers = {
  User: {
    email: doc => checkHelper("email", doc),
    name: doc => checkHelper("name", doc),
    avatar: doc => checkHelper("avatar", doc),
    baseRoles: (parent, args, context) => {
      const { accountId } = context; // get accountId from the parent doc??
      const userId = parent.id;
      return getRolesForUser(userId, accountId, true);
    },
    roles: (parent, args, context) => {
      const { accountId } = context; // get accountId from the parent doc??
      const userId = parent.id;
      return getRolesForUser(userId, accountId);
    },
    entities: (parent, args, context) => {
      const { accountId } = context; // get accountId from the parent doc??
      const userId = parent.id;
      return getUserEntities(userId, accountId);
    }
  },
  UserActivity: {
    id: doc => (doc.id?._str ? doc.id._str : doc.id)
  },
  Query: {
    async getCurrentUser(root, args, context) {
      try {
        const { userId } = context;
        SecurityChecks.checkLoggedIn(userId);
        const user = await User.profile(userId);
        return user;
      } catch (error) {
        debug("GraphQL not logged in!, getCurrentUser has not result.");
        throw error;
      }
    },
    async getUsersForOwnAccount(root, args, context) {
      const { accountId, userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { roles = [] } = args;
      return getUsersForAccount({ accountId, userId }).get({
        accountId,
        roles
      });
    },
    async getUsersForAccount(root, args, context) {
      try {
        const { accountId, userId } = context;
        const { accountId: usersAccountId, roles = [] } = args;

        SecurityChecks.checkLoggedIn(userId);
        const users = await getUsersForAccount({ accountId }).get({
          accountId: usersAccountId,
          roles
        });
        debug("getUsersForAccount", users);
        return users;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async getUserPreferences(root, args, context) {
      const { userId } = context;
      SecurityChecks.checkLoggedIn(userId);
      try {
        const { preferences } =
          (await User.first(userId, { fields: { preferences: 1 } })) || {};
        return preferences;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async getContactInfo(root, args, context) {
      try {
        const { accountId } = context;
        const { userId } = args;

        SecurityChecks.checkLoggedIn(userId);
        const user = await getContactInfo({ accountId }).get({ userId });
        debug("getContactInfo %o", user);
        return user;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async getUserActivity(root, args, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { userIds, activity, thisMonthOnly, limit = 100 } = args.input;

      const res = await UserActivity.where(
        {
          accountId,
          ...(userIds ? { userId: { $in: userIds } } : { userId }),
          ...(activity ? { activity } : {}),
          ...(thisMonthOnly
            ? {
                ts: {
                  $gte: moment()
                    .startOf("month")
                    .toDate()
                }
              }
            : {})
        },
        { limit }
      );

      return res;
    },
    async decodeToken(root, { token }) {
      const credentials = await TokenGenerationService.decodeToken(token);
      return credentials;
    }
  },
  Mutation: {
    async createUser(root, args) {
      // no login check here!
      const { user, account, options } = args.input;

      const srv = createUserService({
        user,
        accountId: account.id,
        accountInput: account,
        options
      });

      const userId = await srv.getUserId();
      return userId;
    },
    async setApiKeyForUser(root, args, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);
      const srv = await setApiKeyForUser({ accountId, userId }).set();
      return srv.getResponse();
    },
    async updateUserSelf(root, args, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const srv = updateUser({ userId, accountId });
      await srv.init({ userId });
      await srv.update({ updates: args.updates });
      return srv.getResponse();
    },
    async updateUserPreferences(root, args, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const srv = updateUser({ userId, accountId });
      await srv.init({ userId });
      await srv.updatePreferences({ updates: args.updates });
      return srv.getResponse();
    },
    async updateUserPreferenceByTopic(root, args, context) {
      const { userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { topic, update } = args.input;
      const srv = updateUserPreferenceByTopic({ userId });
      await srv.init({ userId });
      await srv.setPreference({ topic, update });
      return srv.getUIResponse();
    },
    async upgradeRequest(root, args, context) {
      const { accountId, userId } = context;
      const { reference } = args;

      SecurityChecks.checkLoggedIn(userId);

      await upgradeRequest({ accountId, userId }).post({ reference });
      return true;
    },
    async manuallySetTokenForUser(root, args, context) {
      const { accountId, userId } = context;
      const { route, userId: tokenUserId } = args.input;
      SecurityChecks.checkLoggedIn(userId);

      const srv = manuallySetTokenForLogin({ accountId, userId });

      const { link, tokenLink } = await srv.setToken({
        route,
        userId: tokenUserId
      });

      return { link, tokenLink };
    }
  }
};
