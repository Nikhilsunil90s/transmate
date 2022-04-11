import { Address } from "/imports/api/addresses/Address";
import SecurityChecks from "/imports/utils/security/_security";

// CODE IS NOT USED, can be connected again in frontend
export const claimAddress = ({ accountId, userId }) => ({
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
  async claim() {
    await this.address.update_async({
      claimed: {
        by: this.userId,
        at: new Date(),
        accountId: this.accountId,
        verified: false
      }
    });
  }
});
