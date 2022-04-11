import { Address } from "../Address";

import { CheckAddressSecurity } from "/imports/utils/security/checkUserPermissionsForAddress";

const debug = require("debug")("address:service");

export const AddressService = {
  async init({ addressId, address, accountId, userId }) {
    this.accountId = accountId;
    this.userId = userId;
    if (address) {
      this.address = Address.init(address);
    } else {
      this.address = await Address.first(addressId);
    }
    if (!this.address) {
      throw new Meteor.Error("not-found", "could not find document in db");
    }
    this.addressId = this.address._id;

    return this;
  },
  check({ action }) {
    new CheckAddressSecurity(
      { address: this.address },
      { accountId: this.accountId, userId: this.userId }
    )
      .can({ action })
      .throw();
    return this;
  },
  async addToAddressBook({ name }) {
    await this.address.push_async({
      accounts: {
        id: this.accountId,
        name
      },
      aliases: name,
      linkedAccounts: this.accountId
    });
    return this;
  },
  async anotate(updates) {
    // updates = {<key>,<value>} -> "accounts.$.<key>"
    const accUpdates = {};
    Object.entries(updates).forEach(([k, v]) => {
      accUpdates[`accounts.$.${k}`] = v;
    });

    if (Object.keys(accUpdates).length > 0) {
      debug("anotating address: %o", updates);
      await Address._collection.update(
        {
          _id: this.addressId,
          accounts: {
            $elemMatch: { id: this.accountId }
          }
        },
        { $set: accUpdates },
        { bypassCollection2: true }
      );
    }
    return this;
  },
  get() {
    return this.address;
  }
};
