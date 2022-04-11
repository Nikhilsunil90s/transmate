import { Meteor } from "meteor/meteor";
import { Roles } from "/imports/api/roles/Roles";
import get from "lodash.get";
import { _ } from "meteor/underscore";
import Model from "../Model";
import { oPath } from "/imports/utils/functions/path";
import { UserSchema } from "../_jsonSchemas/simple-schemas/collections/users";

const debug = require("debug")("users:model");
const startsWith = require("underscore.string/startsWith");

const accountIdBuffer = {};

export const AVATAR_PLACEHOLDER =
  "//assets.transmate.eu/app/placeholder-user.png";

class User extends Model {
  static profile(userId) {
    debug("profile call for  %o", userId);
    return this.first(userId, {
      fields: { profile: 1, emails: 1, status: 1, preferences: 1 }
    });
  }

  // eslint-disable-next-line consistent-return
  accountId() {
    debug("depreciated call! to AllAccounts.id()");

    // console.trace();

    const userId = this.getId();
    if (accountIdBuffer[userId]) return accountIdBuffer[userId]; // todo : temp fix to allow sync calls to work after an async call
    const account = _.find(Roles.getScopesForUser(userId), group => {
      return startsWith(group, "account-");
    });
    if (account) {
      return account.replace("account-", "");
    }
  }

  /** @param {string} [userId] */
  static async getAccountId(userId) {
    const usrId = userId;
    const user = await User.first(usrId, { fields: { accountIds: 1 } });
    return user?.accountIds?.[0];
  }

  getAccounts(role = "manage") {
    // eslint-disable-next-line consistent-return
    return _.map(Roles.getScopesForUser(this._id, role), account => {
      const parts = account.match(/^(carrier|shipper)-(.+)$/);
      if (parts.length > 0) {
        return {
          type: parts[1],
          id: parts[2],
          _id: parts[2]
        };
      }
    });
  }

  email() {
    return oPath(["emails", 0, "address"], this);
  }

  getEmail() {
    return get(this, "emails.0.address");
  }

  // DEPRECATED:
  name() {
    if (oPath(["profile", "first"], this)) {
      return `${this.profile.first} ${this.profile.last || ""}`;
    }
    if (oPath(["profile", "name"], this)) {
      return this.profile.name;
    }
    return oPath(["emails", 0, "address"], this);
  }

  /** @returns {string} */
  getName() {
    if (get(this, ["profile", "first"])) {
      return `${this.profile.first} ${this.profile.last || ""}`;
    }
    if (get(this, ["profile", "name"])) {
      return this.profile.name;
    }
    return this.getEmail();
  }

  avatar() {
    return oPath(["profile", "avatar"], this) || AVATAR_PLACEHOLDER;
  }
}

User._collection = Meteor.users;
User._collection.attachSchema(UserSchema);
User._collection = User.updateByAt(User._collection);

// updated by at can not be linked to std Meteor
export { User };
