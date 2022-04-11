import { SecurityCheck } from "/imports/utils/security/_securityCheck";

class CheckAddressSecurity extends SecurityCheck {
  constructor({ address }, { accountId, userId }) {
    super({ accountId, userId });

    // specific here: either projected (=annotation, either with accounts [])
    this.address = address;
    this.isLinked =
      address &&
      (address?.annotation?.id ||
        (address?.accounts || []).filter(item => item.id === this.accountId)
          .length > 0);
  }

  can({ action }) {
    switch (action) {
      case "createAddress":
        this.checks = {
          userHasRole: this.checkUserHasRoles(["core-address-create"])
        };
        break;
      case "removeAddress":
        this.checks = {
          isLinked: this.isLinked,
          userHasRole: this.checkUserHasRoles(["core-address-remove"])
        };
        break;
      case "updateAddress":
        this.checks = {
          isLinked: this.isLinked,
          userHasRole: this.checkUserHasRoles(["core-address-update"])
        };
        break;
      case "overrideAddress":
        this.checks = {
          isLinked: this.isLinked,
          isOnlyLinkedToMe: this.address?.linkedAccountsCount === 1,
          userHasRole: this.checkUserHasRoles(["admin"])
        };
        break;
      default:
        this.allowed = false;
    }
    this.checkAllowed();
    return this;
  }
}

export { CheckAddressSecurity };
