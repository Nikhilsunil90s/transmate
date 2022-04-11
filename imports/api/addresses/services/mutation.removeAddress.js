import { Address } from "/imports/api/addresses/Address";
import { CheckAddressSecurity } from "/imports/utils/security/checkUserPermissionsForAddress";
import SecurityChecks from "/imports/utils/security/_security";

export const removeAddress = ({ accountId, userId }) => ({
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
    return this;
  },
  async check() {
    const check = new CheckAddressSecurity(
      { address: this.address },
      this.context
    );
    await check.getUserRoles();
    check.can({ action: "removeAddress" }).throw();
    return this;
  },
  async remove() {
    await this.address.pull({
      linkedAccounts: this.accountId,
      accounts: { id: this.accountId }
    });
    return true;
  }
});
