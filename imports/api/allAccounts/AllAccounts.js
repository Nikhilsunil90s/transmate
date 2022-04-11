/* eslint-disable consistent-return */
/* eslint-disable camelcase */

import { Accounts } from "meteor/accounts-base";
import { Mongo } from "meteor/mongo";
import { Roles } from "/imports/api/roles/Roles";
import get from "lodash.get";
import Model from "../Model";
import { oPath } from "../../utils/functions/path";
import { isPromise } from "/imports/utils/checkPromise.js";
import { AccountService } from "/imports/api/allAccounts/services/service";

import { User } from "/imports/api/users/User";
import { ByAtSchema } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/_all";
import { BASIC_FEATURES } from "/imports/api/_jsonSchemas/enums/accountFeatures";
import { AccountSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/allAccounts";
import { Address } from "../addresses/Address";
import { publishMyFields } from "./services/fixtures";
import { generateAccountId } from "./services/generateAccountId";

const debug = require("debug")("account:AllAccounts:class");

class AllAccounts extends Model {
  static async create_async(obj, validate) {
    const { type, _id } = obj;
    if (!_id) {
      obj._id = await generateAccountId({ type });
    }

    if (!obj.created) {
      obj.created = ByAtSchema.clean({});
    }
    if (!obj.features) {
      obj.features = BASIC_FEATURES;
    }

    if (validate) {
      return super.create_async(obj);
    }

    const acountId = await this._collection.insert(obj, {
      validate: false
    });
    return this.first(acountId);
  }

  static generateId({ type = "shipper" }) {
    return AccountService.generateId({ type });
  }

  static id(userId) {
    if (!userId) {
      throw Error("dont call AllAccount.id() without user id.");
    }
    return User.init({ _id: userId }).accountId();
  }

  static getType(accountId) {
    if (!accountId) {
      // eslint-disable-next-line no-param-reassign
      accountId = this.id();
    }
    return AccountService.getType({ accountId });
  }

  static myAccount(options = {}) {
    // gets my own account
    const accountId = User.getAccountId();

    if (accountId) {
      return AllAccounts.first({ _id: accountId }, options);
    }
  }

  static async getFeatures(accountId) {
    const account = await this.first(accountId || "none", {
      fields: { features: 1 }
    });
    return account?.features || [];
  }

  static hasFeature(feature) {
    const account = this.myAccount() || {};
    return (account.features || []).includes(feature);
  }

  static findUserByEmail(email) {
    const { _id, profile } = Accounts.findUserByEmail(email) || {}; // quick case insensitive meteor method!
    debug("email %s profile of user %s, %o", email, _id, typeof profile);

    return { _id, profile, email };
  }

  static async findUserByEmail_async(email) {
    let user;
    user = await User.first(
      {
        "emails.0.address": email
      },
      { fields: { _id: 1, profile: 1, emails: 1 } }
    );

    if (!user) {
      // try case insensitive
      user = await User.first(
        {
          "emails.0.address": { $regex: new RegExp(email), $options: "i" }
        },
        { fields: { _id: 1, profile: 1, emails: 1 } }
      );
    }
    if (user) return { ...user, email: user.emails[0].address }; // case sensitive works
    return {};
  }

  static async getUsers(
    accountId,
    roles = ["admin", "driver", "planner"],
    options = { fields: { services: 0 } }
  ) {
    const users = Roles.getUsersInRole(
      roles,
      `account-${accountId}`,
      options
    ).fetch();
    const notGlobalAdmin = user => {
      return !Roles.userIsInRole(user._id, ["admin"], Roles.GLOBAL_GROUP);
    };
    return users.filter(notGlobalAdmin).map(user => {
      return User.init(user);
    });
  }

  static async getUsers_async(
    accountId,
    roles = ["admin", "driver", "planner"],
    options = { fields: { services: 0 } }
  ) {
    const userIds = await Roles.getUserIdsInRole(
      roles,
      `account-${accountId}`,
      options
    );

    return User.where({ _id: { $in: userIds } }, { fields: { services: 0 } });
  }

  static async getUsersForAccount(accountId) {
    const account = await AllAccounts.first(accountId, {
      fields: { userIds: 1 }
    });
    const { userIds = [] } = account || {};
    return User.where({ _id: { $in: userIds } }, { fields: { services: 0 } });
  }

  static getProfileData({ accountId, myAccountId }) {
    if (!myAccountId) {
      // eslint-disable-next-line no-param-reassign
      myAccountId = this.id();
    }
    function filtered(data) {
      return {
        ediId: get(data, ["accounts", 0, "coding", "ediId"]),
        profile: get(data, ["accounts", 0, "profile"]),
        name: get(data, ["accounts", 0, "name"]) || get(data, "name"),
        generalProfile: get(data, "profile")
      };
    }
    const account = this.first(
      accountId,
      publishMyFields({ accountId: myAccountId }) // performs array projection
    );
    if (!isPromise(account)) {
      // return when run in meteor
      return filtered(account);
    }

    // call when in mocha (pure js)
    debug("promise call, return promise for first");

    return account.then(data => {
      debug("getProfileData result %s %o", accountId, data);
      return filtered(data);
    });
  }

  mail() {
    // catch for mail instead of email use
    return this.getEmail();
  }

  async email() {
    // TODO review this method!! is called by notitions
    const user = await Roles.getUsersInRole(
      "admin",
      `account-${this.getId()}`,
      {
        sort: {
          "roles.__global_roles__": 1
        },
        fields: {
          "emails.address": 1
        }
      }
    ).fetch()[0];
    if (user && user.emails) {
      return user.emails[0].address;
    }
  }

  address() {
    const addressId = oPath(["locations", "main"], this);
    return Address.first({ _id: addressId });
  }

  formatted() {
    return `${this.name} <span style='opacity:.5'> —${this.id}</span>`;
  }

  getName() {
    // ! make sure the accounts field is projected when you use this method!!
    return get(this, ["accounts", 0, "name"], this.name);
  }
}

AllAccounts.publishMyFields = publishMyFields;
AllAccounts._collection = new Mongo.Collection("accounts");

AllAccounts._collection.attachSchema(AccountSchema);

AllAccounts._collection = AllAccounts.updateByAt(AllAccounts._collection);
export { AllAccounts };
