import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { CheckPartnershipSecurity } from "/imports/utils/security/checkUserPermissionsForPartnerShip";
import SecurityChecks from "/imports/utils/security/_security";

export const addToFavorites = ({ userId, accountId }) => ({
  userId,
  accountId,
  async favorite({ partnerId, add }) {
    const partner = await AllAccounts.first(partnerId);
    SecurityChecks.checkIfExists(partner);

    new CheckPartnershipSecurity(
      { partner },
      { accountId: this.accountId, userId: this.userId }
    )
      .can({ action: "canAddRemoveFromFavorites" })
      .throw();

    if (add) {
      return partner.push({ shortlistedBy: this.accountId }, true);
    }
    return partner.pull({ shortlistedBy: this.accountId });
  }
});
