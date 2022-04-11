import pick from "lodash.pick";
import get from "lodash.get";

import { AllAccounts } from "../AllAccounts";
import { User } from "../../users/User";
import { Address } from "../../addresses/Address";

import { publishMyFields } from "./fixtures";
import SecurityChecks from "/imports/utils/security/_security.js";

const debug = require("debug")("account:method");

export const accountGetProfileService = ({ accountId, myAccountId }) => ({
  accountId,
  myAccountId,
  isOwnAccount: myAccountId === accountId,
  profile: {},

  getAccountDoc() {
    // if own data -> return my account, if partner, get my data
    this.account = AllAccounts.first(
      this.accountId,
      publishMyFields({ accountId: this.myAccountId })
    );
    return this;
  },

  async getAccountDoc_async() {
    // if own data -> return my account, if partner, get my data
    this.account = await AllAccounts.first(
      this.accountId,
      publishMyFields({ accountId: this.myAccountId })
    );
    return this;
  },

  check() {
    SecurityChecks.checkIfExists(this.account);
    return this;
  },

  /** get profile data from the accounts [] (projection ensures this is el 0) */
  getProfileData() {
    if (!this.isOwnAccount) {
      this.profile = get(this.account, ["accounts", 0, "profile"]) || {};
      this.publicProfile = this.account.profile || {};
      debug("account.getProfile", this.profile);
    } else {
      this.profile = this.account.profile || {};
      this.publicProfile = {};
    }
    return this;
  },

  getLinkedContacts() {
    // combine official with own data:
    let contacts = this.profile.contacts || [];
    (this.publicProfile.contacts || []).forEach(contact => {
      const exists = contacts.find(({ mail }) => mail === contact.mail);
      if (!exists) {
        contacts.push({ ...contact, isOfficial: true });
      }
    });

    // if userId is present, user has a userDoc
    const userIds = contacts.reduce((acc, { userId }) => {
      if (userId) {
        acc.push(userId);
      }
      return acc;
    }, []);

    let userDocs = [];
    if (userIds.length > 0) {
      userDocs = User.where(
        { _id: { $in: userIds } },
        { fields: { profile: 1, "services.password": 1 } }
      );
    }

    // TODO [#239]: find a better way to know if the user has signed on or not.

    contacts = contacts.map(({ userId, ...user }) => {
      if (userId) {
        const usrDoc = userDocs.find(({ id }) => id === userId);
        const usr = User.init(usrDoc);
        return {
          ...user,
          userId,
          avatar: usr.avatar(),
          signedOn: !!usrDoc.pasword
        };
      }
      return {
        ...user,
        avatar: "//assets.transmate.eu/app/placeholder-user.png"
      };
    });

    this.profile.contacts = contacts;
    return this;
  },

  getLinkedLocations() {
    let locations = this.profile.locations || [];

    locations = locations.filter(({ addressId }) => addressId);
    const addressIds = locations.map(({ addressId }) => addressId);

    let addressDocs = [];
    if (addressIds.length > 0) {
      addressDocs = Address.where(
        { _id: { $in: addressIds } },
        { fields: { ...Address.publish } }
      );
    }
    locations = locations.map(({ addressId, ...address }) => {
      if (addressId) {
        const doc = addressDocs.find(({ id }) => id === addressId) || {};
        const addressDoc = Address.init(doc);
        return {
          ...address,
          ...doc,
          name: addressDoc.name(),
          addressId
        };
      }
      return address;
    });

    this.profile.locations = locations;

    return this;
  },

  combinePublicAndSpecificData() {
    // location & contacts are now both public & account specific, now do it for the rest:
    ["services", "footprint", "certificates", "sites"].forEach(topic => {
      if (!this.profile[topic]) {
        this.profile[topic] = this.publicProfile[topic];
      }
    });
    return this;
  },

  get() {
    return {
      ...pick(this.account, [
        "_id",
        "logo",
        "description",
        "id",
        "banner",
        "partners"
      ]),
      ...this.profile,
      name: get(this.account, ["accounts", 0, "name"], this.account.name)
    };
  },

  getNameAndContacts() {
    return {
      name: get(this.account, ["accounts", 0, "name"]) || this.account.name,
      contacts: get(this.account, ["accounts", 0, "profile", "contacts"], [])
    };
  }
});
