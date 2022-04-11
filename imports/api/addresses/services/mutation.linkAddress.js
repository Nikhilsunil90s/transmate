import { Address } from "/imports/api/addresses/Address";
import SecurityChecks from "/imports/utils/security/_security";
import { getAddress } from "./query.getAddressWithAnnotation";

const debug = require("debug")("address:resolvers");

export const linkAddress = ({ accountId, userId }) => ({
  accountId,
  userId,
  context: { accountId, userId },
  async init({ addressId }) {
    this.addressId = addressId;

    [this.address] = await Address._collection.aggregate([
      { $match: { _id: addressId } },
      Address.projectFieldsAggr(this.accountId)
    ]);
    SecurityChecks.checkIfExists(this.address);
    this.address = Address.init(this.address);

    if (this.address.accounts?.[0]?.id === this.accountId) {
      this.isAlreadyLinked = true;
    }

    return this;
  },

  async link({ name, updates }) {
    if (!this.isAlreadyLinked) {
      await this.address.push({
        accounts: {
          id: this.accountId,
          name
        },
        aliases: name,
        linkedAccounts: this.accountId
      });
    }

    // TODO [#235]: do updates in address, if it is linked to another account, copy the address!
    debug("updates in address while linking: %o", updates);

    return this;
  },
  getUIResponse() {
    return getAddress(this.context).get({ addressId: this.addressId });
  }
});
