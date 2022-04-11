import get from "lodash.get";
import { SecurityCheck } from "./_securityCheck.js";

const debug = require("debug")("function:check-user-permissions");

export const dbFields = {
  tenderBidId: 1,
  offer: 1,
  contacts: 1,
  status: 1,
  accountId: 1,
  worker: 1
};
const getRoleForTenderify = ({ tenderBid = {}, accountId, userId }) => {
  const contacts = tenderBid.contacts || []; // internal users
  const contact = contacts.find(el => el.userId === userId) || {};

  return {
    isOwner: tenderBid.accountId === accountId,
    userRole: contact.role || "locked"
  };
};
class CheckTenderifySecurity extends SecurityCheck {
  constructor({ tenderBid }, { accountId, userId }) {
    super({ accountId, userId });

    // specific here:
    this.tenderBid = tenderBid || {};
    this.status = get(tenderBid, ["status"]);
    this.role = getRoleForTenderify({ tenderBid, accountId, userId });
  }

  can({ action }) {
    // controls the tab visibility:
    switch (action) {
      //#region footer button control
      case "canRelease": {
        this.checks = {
          status: ["draft", "review"].includes(this.status),
          isOwner: this.role.isOwner,
          roleInTenderBid:
            ["owner", "manager"].includes(this.role.userRole) ||
            this.checkUserHasRoles(["admin"])
        };
        break;
      }
      case "canSetBackToDraft": {
        this.checks = {
          status: ["open", "review"].includes(this.status),
          isOwner: this.role.isOwner,
          roleInTenderBid:
            ["owner", "manager"].includes(this.role.userRole) ||
            this.checkUserHasRoles(["admin"])
        };
        break;
      }
      case "canSetToReview": {
        this.checks = {
          status: ["open"].includes(this.status),
          isOwner: this.role.isOwner,
          roleInTenderBid:
            ["owner", "manager"].includes(this.role.userRole) ||
            this.checkUserHasRoles(["admin"])
        };
        break;
      }
      case "canBeClosed": {
        this.checks = {
          status: ["review"].includes(this.status),
          isOwner: this.role.isOwner,
          roleInTenderBid:
            ["owner", "manager"].includes(this.role.userRole) ||
            this.checkUserHasRoles(["admin"])
        };
        break;
      }
      case "canBeCanceled": {
        this.checks = {
          status: ["draft", "closed"].includes(this.status),
          isOwner: this.role.isOwner,
          roleInTenderBid:
            ["owner", "manager"].includes(this.role.userRole) ||
            this.checkUserHasRoles(["admin"])
        };
        break;
      }
      //#endregion
      //#region general accessControls:
      case "createBid": {
        this.checks = true;
        break;
      }
      case "editGeneral": {
        // edit general section
        this.checks = {
          isOwner: this.role.isOwner, // owner account
          roleInTenderBid:
            ["manager", "owner"].includes(this.role.userRole) ||
            this.checkUserHasRoles(["admin"])
        };
        break;
      }
      case "startWorkflow": {
        // add a workflow step
        this.checks = {
          isOwner: this.role.isOwner, // owner account
          roleInTenderBid:
            ["manager", "owner"].includes(this.role.userRole) ||
            this.checkUserHasRoles(["admin"])
        };
        break;
      }
      case "editContacts": {
        this.checks = {
          isOwner: this.role.isOwner, // owner account
          roleInTenderBid:
            ["manager", "owner"].includes(this.role.userRole) ||
            this.checkUserHasRoles(["admin"])
        };
        break;
      }
      case "editRequirement": {
        this.checks = {
          isOwner: this.role.isOwner, // owner account
          roleInTenderBid:
            ["manager", "owner"].includes(this.role.userRole) ||
            this.checkUserHasRoles(["admin"]),
          status: ["draft"].includes(this.status)
        };
        break;
      }

      case "changePartner": {
        this.checks = {
          isOwner: this.role.isOwner, // owner account
          roleInTenderBid:
            ["manager", "owner"].includes(this.role.userRole) ||
            this.checkUserHasRoles(["admin"]),
          status: ["open"].includes(this.status)
        };
        break;
      }
      case "editPartnerData": {
        this.checks = {
          isOwner: this.role.isOwner, // owner account
          roleInTenderBid:
            ["manager", "owner"].includes(this.role.userRole) ||
            this.checkUserHasRoles(["admin"])
        };
        break;
      }
      case "editBiddingSheet":
      case "addMapping":
      case "editMapping": {
        this.checks = {
          isOwner: this.role.isOwner, // owner account
          roleInTenderBid:
            ["manager", "owner"].includes(this.role.userRole) ||
            this.checkUserHasRoles(["admin"])
        };
        break;
      }
      case "removeMapping": {
        this.checks = {
          isOwner: this.role.isOwner, // owner account
          roleInTenderBid:
            ["manager", "owner"].includes(this.role.userRole) ||
            this.checkUserHasRoles(["admin"])
        };
        break;
      }
      case "generateOffer": {
        this.checks = {
          isOwner: this.role.isOwner, // owner account
          roleInTenderBid:
            ["manager", "owner"].includes(this.role.userRole) ||
            this.checkUserHasRoles(["admin"])
        };
        break;
      }
      //#endregion
      default:
        debug("not allowed to do :", { action }); // means it is missing
        this.allowed = false;
    }

    this.checkAllowed();
    return this;
  }
}

export { CheckTenderifySecurity };
