import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import SecurityChecks from "/imports/utils/security/_security.js";
import { publishMyFields } from "/imports/api/allAccounts/services/fixtures";
import get from "lodash.get";

export const saveAddressContacts = ({ accountId, userId }) => ({
  accountId,
  userId,
  init({ addressId, partnerId }) {
    this.addressId = addressId;
    this.partnerId = partnerId;
    this.partner = AllAccounts.first(
      partnerId,
      publishMyFields({ accountId: this.accountId })
    );

    SecurityChecks.checkIfExists(this.partner);
    return this;
  },
  async saveContacts({ contacts }) {
    // 1 filter out all contacts related to this addressId
    // 2 add the new ones
    // 3 save

    const allContacts = get(
      this.partner,
      ["accounts", 0, "profile", "contacts"], // !! projection
      []
    );
    const newContacts = [
      ...allContacts.filter(contact => contact.addressId !== this.addressId),
      ...contacts.map(contact => ({ ...contact, addressId: this.addressId }))
    ];

    await AllAccounts._collection.update(
      {
        _id: this.partnerId,
        accounts: { $elemMatch: { accountId: this.accountId } }
      },
      { $set: { "accounts.$.profile.contacts": newContacts } },
      { bypassCollection2: true }
    );

    return true;
  }
});
