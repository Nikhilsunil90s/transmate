import { AllAccountsSettings } from "/imports/api/allAccountsSettings/AllAccountsSettings";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { Cost } from "/imports/api/costs/Cost";
import { publishFields } from "../services/fixtures";

import {
  getPartner,
  getPartners,
  getItemTypes,
  searchDirectory,
  getDirectorySearchOptions,
  getAccountUsers
} from "../services/_queries";

import {
  invitePartner,
  createPartnership,
  updatePartnership,
  addToFavorites,
  removeUserFromAccount,
  addUserToAccount,
  updateUserRoles,
  updateAccount,
  updateSettingsCosts,
  updateUserEntities,
  annotatePartner
} from "../services/_mutations";

import { AccountService } from "../services/service";
import SecurityChecks from "/imports/utils/security/_security.js";
import { accountGetProfileService } from "../services/accountGetProfile";
import { get } from "lodash";
import { userContactService } from "../services/accountsUserService";
import { User } from "../../users/User";

const debug = require("debug")("allaccounts:resolvers:users");

export const resolvers = {
  // try to phase this one out:
  AccountType: {
    async annotation(parent, args, context) {
      const { loaders } = context;
      debug(
        "account annotation %o, annotation exists? %o",
        parent._id,
        !!parent.annotation
      );
      if (!parent._id) return {};
      if (parent.annotation) return parent.annotation;
      const result = (await loaders.allAccountsLoader.load(parent._id)) || {};

      if (result && Array.isArray(result.accounts)) {
        return result.accounts[0];
      }

      return {};
    }
  },
  AccountTypeD: {
    isFavorite(parent, args, context) {
      return (parent.shortlistedBy || []).includes(context.accountId);
    }
  },
  AccountSettings: {
    costs(parent, args, context) {
      const { accountId } = context;
      return Cost.where({ _id: { $in: parent.costIds || [] }, accountId });
    }
  },
  Query: {
    async getPartner(root, args, context) {
      const { accountId, userId } = context;
      const { partnerId } = args;

      SecurityChecks.checkLoggedIn(userId);
      const partner = await getPartner({ accountId, userId }).get({
        partnerId
      });
      return partner;
    },
    async getPartners(root, args, context) {
      const { accountId, userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const {
        types,
        includeOwnAccount,
        includeInactive,
        excludeAccounts
      } = args;
      debug("getPartners args %o", {
        types,
        includeOwnAccount,
        includeInactive,
        excludeAccounts
      });

      const res = await getPartners({ accountId, userId }).get({
        types,
        includeOwnAccount,
        excludeAccounts,
        includeInactive
      });
      debug("partners %o", res);
      return res;
    },
    async getOwnAccount(root, args, context) {
      const { accountId, userId } = context;

      SecurityChecks.checkLoggedIn(userId);

      const options = { fields: { ...publishFields } };
      const account = await AllAccounts.first({ _id: accountId }, options);
      return {
        ...account,
        type: AccountService.getType({ accountId })
      };
    },
    async getAccountSettings(root, args, context) {
      const { accountId, userId } = context;
      SecurityChecks.checkLoggedIn(userId);
      debug("getAccountSettings accountId? %o, with args %o", accountId, args);
      const settings = await AllAccountsSettings.first(accountId);
      if (settings && typeof settings.roles === "object") {
        settings.roleNames = Object.keys(settings.roles);
      }

      return settings;
    },
    async getSettingsItemTypes(root, args, context) {
      const { accountId, userId } = context;
      const { includeBaseUOMS } = args;

      SecurityChecks.checkLoggedIn(userId);
      const units = await getItemTypes({ accountId, userId }).get({
        includeBaseUOMS
      });
      debug(units);
      return units;
    },
    async searchDirectory(root, args, context) {
      const { accountId, userId } = context;
      const { filter, limit } = args.input;

      SecurityChecks.checkLoggedIn(userId);
      const res = await searchDirectory({ accountId, userId }).get({
        filter,
        limit
      });
      return res;
    },
    async getSearchOptionsDirectory(root, args, context) {
      const { accountId, userId } = context;
      SecurityChecks.checkLoggedIn(userId);
      const srv = getDirectorySearchOptions({ accountId, userId });

      const [services, certificates] = await Promise.all([
        srv.getServices(),
        srv.getCertificates()
      ]);
      return { services, certificates };
    },
    async getAccountUsers(root, args, context) {
      const { accountId, userId } = context;

      SecurityChecks.checkLoggedIn(userId);
      const res = await getAccountUsers({ accountId, userId }).getUsers();
      return res;
    },
    async getProfile(root, { accountId }, { userId, accountId: myAccountId }) {
      SecurityChecks.checkLoggedIn(userId);

      return accountGetProfileService({ accountId, myAccountId })
        .getAccountDoc()
        .check()
        .getProfileData()
        .getLinkedContacts()
        .getLinkedLocations()
        .combinePublicAndSpecificData()
        .get();
    },
    async getAccountPlanners(root, args, context) {
      const { accountId } = context;
      debug("getGeneralPlanners accountId? %o", accountId);
      const account = await AllAccounts.first(accountId, {
        fields: { userIds: 1 }
      });
      const users = await User.where(
        { _id: { $in: account.userIds || [] } },
        { fields: { profile: 1 } }
      );
      return users;
    }
  },
  Mutation: {
    async inviteAccount(root, args, context) {
      const { accountId, userId } = context;
      const partnerData = args.input || {};

      SecurityChecks.checkLoggedIn(userId);

      const srv = invitePartner({ userId, accountId });
      await srv.setUpPartner(partnerData);
      srv.setupNotifications();
      return srv.get();
    },
    async createPartnership(root, args, context) {
      const { accountId, userId } = context;
      const { partnerId } = args;

      SecurityChecks.checkLoggedIn(userId);
      const srv = createPartnership({ accountId, userId });
      await srv.create({ partnerId });
      srv.setupNotifications();
      return srv.get();
    },
    async updatePartnership(root, args, context) {
      const { accountId, userId } = context;
      const { partnerId, action } = args;

      SecurityChecks.checkLoggedIn(userId);
      const srv = await updatePartnership({ accountId, userId }).update({
        partnerId,
        action
      });
      return srv.getUIResponse();
    },
    async annotatePartner(r, args, context) {
      const { accountId, userId } = context;
      const { partnerId, root, update } = args.input || {};

      debug({ partnerId, root, update });

      SecurityChecks.checkLoggedIn(userId);
      const srv = annotatePartner({ accountId, userId });
      await srv.getAccountDoc({ partnerId });
      await srv.check();
      await srv.updateProfileData({ update, root });
      return srv.getUIResponse();
    },
    async addToFavorites(root, args, context) {
      const { accountId, userId } = context;
      const { partnerId, add } = args.input;

      SecurityChecks.checkLoggedIn(userId);
      return addToFavorites({ accountId, userId }).favorite({
        partnerId,
        add
      });
    },
    async updateAccountSettings(root, args, context) {
      const { userId, accountId } = context;
      const { updates } = args;

      SecurityChecks.checkLoggedIn(userId);

      await AllAccountsSettings._collection.update(
        { _id: accountId },
        { $set: updates },
        { upsert: true }
      );
      const res = await AllAccountsSettings.first(accountId);
      return res;
    },
    async removeUserFromAccount(root, args, context) {
      const { accountId, userId } = context;
      const { userId: userIdToRemove } = args;

      SecurityChecks.checkLoggedIn(userId);
      const srv = await removeUserFromAccount({ accountId, userId }).get({
        userId: userIdToRemove
      });
      await srv.runChecks();
      await srv.remove();

      return srv.getUIResponse();
    },
    async addUserToAccount(root, args, context) {
      const { accountId, userId } = context;
      const { user, options } = args.input;

      SecurityChecks.checkLoggedIn(userId);
      debug("adding user to account", { user, options });
      const srv = await addUserToAccount({ accountId, userId }).get();
      await srv.add({ user, options });
      const res = srv.getResponse();
      debug("new userId", res);
      return res;
    },
    async updateUserRole(root, args, context) {
      const { accountId, userId } = context;
      const { userId: userIdToAlter, role, remove } = args.input;

      SecurityChecks.checkLoggedIn(userId);

      const srv = await updateUserRoles({ accountId, userId }).get({
        userIdToAlter,
        role,
        remove
      });
      await srv.update();
      return srv.getResponse();
    },
    async updateUserEntities(root, args, context) {
      const { accountId, userId } = context;
      const { userId: userIdToAlter, entity, remove } = args.input;

      SecurityChecks.checkLoggedIn(userId);

      const srv = await updateUserEntities({ accountId, userId }).get({
        userIdToAlter,
        entity,
        remove
      });
      await srv.update();
      return srv.getResponse();
    },
    async updateAccount(root, args, context) {
      const { accountId, userId } = context;
      const { updates } = args;

      const srv = updateAccount({ userId, accountId });
      await srv.init();
      await srv.update({ updates });
      return srv.getResponse();
    },
    async removeAccountSettingsCost(root, args, context) {
      const { accountId, userId } = context;
      const { id } = args;
      return updateSettingsCosts({ accountId, userId }).remove({ id });
    },
    async upsertAccountSettingsCost(root, args, context) {
      const { accountId, userId } = context;
      const { id, cost, group } = args.input;

      return updateSettingsCosts({ accountId, userId }).upsert({
        id,
        cost,
        group
      });
    },

    async createUserByContact(
      root,
      { input: { partnerId, contact, options } },
      { userId, accountId: ownAccountId }
    ) {
      debug("create user for %s with email %s", partnerId, contact.mail);
      SecurityChecks.checkLoggedIn(userId);
      const accountId = get(options, "invokingAccountId") || ownAccountId;
      const srv = await userContactService({ userId, accountId }).init({
        partnerId,
        accountId
      });
      await srv.createUserIfNotExists({
        contact,
        options: { sendWelcomeMail: false, ...options }
      });
      await srv.addToContacts();
      const { userId: newUserId, url } = srv.get();
      debug("user created %s", newUserId);
      return { userId: newUserId, url };
    }
  }
};
