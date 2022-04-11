import { SecurityCheck } from "./_securityCheck";

export const fields = {
  _id: 1
};
class CheckAccountSecurity extends SecurityCheck {
  constructor({ account }, { accountId, userId }) {
    super({ accountId, userId });

    // specific here:
    this.account = account || {};
    this.accountIdToCheck = this.account._id || this.account.id || accountId; // if accountId == self
    this.isOwnAccount = this.accountIdToCheck === this.accountId;
  }

  can({ action, data = {} }) {
    this.multiCheck = false;
    switch (action) {
      case "canEditUsers": {
        const { role, userId, remove } = data;
        this.checks = {
          isOwnAccount: this.isOwnAccount,
          userHasRole: this.checkUserHasRoles(["core-account-editUsers"]),
          notUnsettingMyselfAsAdmin: !(
            remove &&
            role === "admin" &&
            userId === this.userId
          )
        };
        break;
      }
      case "canAddUsers": {
        this.checks = {
          isOwnAccount: this.isOwnAccount,
          userHasRole: this.checkUserHasRoles(["core-account-addUsers"])
        };
        break;
      }
      case "canRemoveUsers": {
        const { userId } = data;
        this.checks = {
          isOwnAccount: this.isOwnAccount,
          userHasRole: this.checkUserHasRoles(["core-account-removeUsers"]),
          notRemovingSelf: userId !== this.userId
        };
        break;
      }
      case "canEditAccountPortal":
        this.checks = {
          isOwnAccount: this.isOwnAccount,
          userHasRole: this.checkUserHasRoles([
            "core-account-editAccountPortal"
          ])
        };
        break;
      case "canEditFuelModel": // data: fuelAccountId
        this.checks = {
          isOwnAccount: this.isOwnAccount,
          userHasRole: this.checkUserHasRoles(["core-account-editFuelModel"]),
          data: data.fuelAccountId === this.accountId
        };
        break;
      case "canEditEntities":
        this.checks = {
          isOwnAccount: this.isOwnAccount,
          userHasRole: this.checkUserHasRoles(["core-account-editEntities"])
        };
        break;
      case "canEditMasterData":
        this.checks = {
          isOwnAccount: this.isOwnAccount,
          userHasRole: this.checkUserHasRoles(["core-account-editMasterData"])
        };
        break;
      default:
        this.allowed = false;
    }
    this.checkAllowed();

    return this;
  }
}

export { CheckAccountSecurity };
