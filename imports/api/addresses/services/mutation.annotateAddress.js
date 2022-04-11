import { Address } from "/imports/api/addresses/Address";
import { CheckAddressSecurity } from "/imports/utils/security/checkUserPermissionsForAddress";
import SecurityChecks from "/imports/utils/security/_security";
import { AddressAnnotationSchema } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/address-annotation";
import { getAddress } from "./query.getAddressWithAnnotation";

export const annotateAddress = ({ accountId, userId }) => ({
  accountId,
  userId,
  context: { accountId, userId },
  async init({ addressId }) {
    this.addressId = addressId;

    this.address = await Address.first(
      addressId,
      Address.projectFields(this.accountId)
    );
    SecurityChecks.checkIfExists(this.address);

    if (this.address.accounts[0].id !== this.accountId)
      throw new Error("Address not linked to your account");

    return this;
  },
  async check() {
    const check = new CheckAddressSecurity(
      { address: this.address },
      this.context
    );
    await check.getUserRoles();
    check.can({ action: "updateAddress" }).throw();
    return this;
  },

  /**
   * // this allows to annotate (not update address fields itself!)
   * @param {{updates: Object}} param0
   */
  async update({ updates }) {
    const update = {};
    const cleanUpdates = AddressAnnotationSchema.omit("id").clean(updates);
    Object.keys(cleanUpdates).forEach(key => {
      update[`accounts.$.${key}`] = updates[key];
    });
    if (Object.entries(update).length === 0) {
      throw new Error("empty", "No updates to save");
    }
    await Address._collection.update(
      {
        _id: this.addressId,
        accounts: {
          $elemMatch: { id: this.accountId }
        }
      },
      { $set: update },
      { bypassCollection2: true }
    );
    return this;
  },
  getUIResponse() {
    return getAddress(this.context).get({ addressId: this.addressId });
  }
});
