import get from "lodash.get";
import { SecurityCheck } from "./_securityCheck";

const debug = require("debug")("partnership:security");

class CheckPartnershipSecurity extends SecurityCheck {
  constructor({ partner }, { accountId, userId }) {
    debug("run CheckPartnershipSecurity on %o", partner);
    super({ accountId, userId });

    // specific here:
    this.partner = partner || {}; // partner account
    this.partnership =
      this.partner.partnership ||
      (this.partner.partners || []).find(
        ({ accountId: accId }) => accId === this.accountId
      );
    this.partnerShipStatus = get(this.partnership, ["status"]);

    // ! note: in the partners array the requestor flag is on if that party is the requestor
    // so -> if in partner account requestor is false -> I am the requestor
    this.iAmRequestor = this.partnership && !this.partnership.requestor;
    debug(
      "security checks iAmRequestor %o on data %o",
      this.iAmRequestor,
      this.partnership
    );
  }

  can({ action }) {
    switch (action) {
      case "canCreatePartnerShip":
        this.checks = {
          noPartnerShipExists: !this.partnerShipStatus,
          userHasRole: this.checkUserHasRoles(["core-partners-create"])
        };
        break;
      case "canBeDeactivated":
        // both sides can deactivate a request
        this.checks = {
          userHasRole: this.checkUserHasRoles(["core-partners-remove"]),
          status: ["active", "requested"].includes(this.partnerShipStatus)
        };
        break;
      case "canAcceptRejectRequest":
        this.checks = {
          userHasRole: this.checkUserHasRoles([
            "core-partners-acceptRejectRequest"
          ]),
          status: ["requested"].includes(this.partnerShipStatus),
          notRequestingAccount: !this.iAmRequestor
        };
        break;
      case "canResendRequest":
        this.checks = {
          userHasRole: this.checkUserHasRoles(["core-partners-create"]),
          status: ["requested"].includes(this.partnerShipStatus),
          requestingAccount: this.iAmRequestor
        };
        break;
      case "canBeReactivated":
        // both sides can deactivate a request
        this.checks = {
          userHasRole: this.checkUserHasRoles(["core-partners-create"]),
          status: ["inactive"].includes(this.partnerShipStatus)
        };
        break;
      case "canAddRemoveFromFavorites":
        this.checks = {
          userHasRole: this.checkUserHasRoles(["core-partners-addToFavorites"])
        };
        break;
      case "canAnnotatePartner":
        this.checks = {
          status: ["active", "requested"].includes(this.partnerShipStatus),
          userHasRole: this.checkUserHasRoles(["core-partners-annotate"])
        };
        break;
      default:
        this.allowed = false;
    }

    this.checkAllowed();
    if (!this.allowed) {
      debug(
        "partnership checks: %o, action: %s; allowed: %s",
        this.checks,
        action,
        this.allowed
      );
    }
    return this;
  }
}

export { CheckPartnershipSecurity };
