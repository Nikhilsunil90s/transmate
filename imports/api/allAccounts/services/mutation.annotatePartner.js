import get from "lodash.get";

import { Address } from "../../addresses/Address";
import { AllAccounts } from "../AllAccounts";
import SecurityChecks from "/imports/utils/security/_security.js";
import { getPartner } from "./query.getPartner";

export const annotatePartner = ({ accountId, userId }) => ({
  accountId,
  userId,
  async getAccountDoc({ partnerId }) {
    this.partnerId = partnerId;
    this.isOwnAccount = partnerId === this.accountId;
    this.account = await AllAccounts.first(this.partnerId, {
      fields: { accounts: { $elemMatch: { accountId } } },
      partners: { $elemMatch: { accountId } }
    });
    return this;
  },

  async check() {
    SecurityChecks.checkIfExists(this.account);

    // ensure I have an annotation object:
    if (!get(this.account, ["accounts", 0, "accountId"])) {
      await this.account.push({ accounts: { accountId: this.accountId } });
    }
    return this;
  },

  async updateProfileData({ update, root }) {
    if (Object.keys(update || {}).length === 0) return this;

    if (this.isOwnAccount) {
      await this.account.update_async(update);
    } else {
      const updates = {};
      Object.entries(update).forEach(([k, v]) => {
        if (root === "profile" && k === "name") {
          // name
          updates[`accounts.$.${k}`] = v;
        } else {
          updates[`accounts.$.${root}.${k}`] = v;
        }
      });
      await AllAccounts._collection.update(
        {
          _id: this.partnerId,
          accounts: {
            $elemMatch: { accountId: this.accountId }
          }
        },
        { $set: updates },
        { bypassCollection2: true }
      );
    }

    // post save: locations - address collection
    if (update.locations) {
      await Promise.all(
        update.locations.map(({ addressId }) => {
          // when the address is in the addressbook, the accounts [] has our accountId in it. If not, this operation would fail
          return Address._collection.update(
            {
              _id: addressId,
              accounts: {
                $elemMatch: { id: this.accountId }
              }
            },
            { $set: { "accounts.$.linkedPartner": this.partnerId } },
            { bypassCollection2: true }
          );
        })
      );
    }

    return this;
  },
  async getUIResponse() {
    const partner = await getPartner({
      accountId: this.accountId,
      userId: this.userId
    }).get({ partnerId: this.partnerId });
    return partner;
  }
});
