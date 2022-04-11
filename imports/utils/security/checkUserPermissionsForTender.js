import get from "lodash.get";
import { SecurityCheck } from "./_securityCheck.js";
import { getRoleForTender } from "./_checkRoleInTender";

export const fields = {
  status: 1,
  contacts: 1,
  accountId: 1,
  customerId: 1,
  bidders: 1
};
class CheckTenderSecurity extends SecurityCheck {
  constructor({ tender }, { accountId, userId }) {
    super({ accountId, userId });

    this.tender = tender || {};
  }

  // user roles should be set prior to calling init
  init() {
    this.status = get(this.tender, ["status"]);
    this.role = getRoleForTender(
      { tender: this.tender },
      {
        accountId: this.accountId,
        userId: this.userId,
        isAdmin: this.checkUserHasRoles(["admin"])
      }
    );
    this.myBid = (this.tender.bidders || []).find(
      bid => bid.accountId === this.accountId
    );
    return this;
  }

  can({ action, data }) {
    // controls the tab visibility:
    switch (action) {
      case "viewTabs": {
        const { viewAs } = data || {};
        switch (viewAs) {
          case "owner":
            this.checks = {
              roleInTender: ["owner", "manager"].includes(this.role.userRole)
            };
            break;
          case "viewer":
            this.checks = {
              isOwner: this.role.isOwner,
              userHasRole: ["owner", "manager", "follower", "analyst"].includes(
                this.role.userRole
              ),
              status: ["open", "review", "closed"].includes(this.status)
            };
            break;
          case "bidderPassedNDA": {
            const NDArequired = get(this.tender, ["params", "NDA", "required"]);
            const NDAaccepted = get(this.myBid, ["NDAresponse", "accepted"]);

            this.checks = {
              isBidder: this.role.isBidUser, // bidder account
              status: ["open"].includes(this.status),
              NDApassed: !NDArequired || (NDArequired && NDAaccepted)
            };
            break;
          }

          case "bidder": {
            const NDArequired = get(this.tender, ["params", "NDA", "required"]);
            const NDAaccepted = get(this.myBid, ["NDAresponse", "accepted"]);

            this.checks = {
              isBidder: this.role.isBidder, // bidder account
              status: ["open"].includes(this.status),
              NDApassed: NDArequired && !NDAaccepted
            };
            break;
          }
          default:
            this.allowed = false;
        }
        break;
      }

      // footer button control:
      case "canRelease": {
        this.checks = {
          status: ["draft", "review"].includes(this.status),
          isOwner: this.role.isOwner,
          roleInTender: ["owner", "manager"].includes(this.role.userRole),
          hasBidders: get(this, ["tender", "bidders", "length"]) > 0
        };
        break;
      }
      case "canSetBackToDraft": {
        this.checks = {
          status: ["open", "review"].includes(this.status),
          isOwner: this.role.isOwner,
          roleInTender: ["owner", "manager"].includes(this.role.userRole)
        };
        break;
      }
      case "canSetToReview": {
        this.checks = {
          status: ["open"].includes(this.status),
          isOwner: this.role.isOwner,
          roleInTender: ["owner", "manager"].includes(this.role.userRole)
        };
        break;
      }
      case "canBeClosed": {
        this.checks = {
          status: ["review"].includes(this.status),
          isOwner: this.role.isOwner,
          roleInTender: ["owner", "manager"].includes(this.role.userRole)
        };
        break;
      }
      case "canBeCanceled": {
        this.checks = {
          status: ["draft", "closed"].includes(this.status),
          isOwner: this.role.isOwner,
          roleInTender: ["owner", "manager"].includes(this.role.userRole)
        };
        break;
      }

      // general accessControls:
      case "viewDashboard": {
        // has test
        this.checks = {
          isOwner: this.role.isOwner // owner account
        };
        break;
      }
      case "editGeneral": {
        // has test
        this.checks = {
          isOwner: this.role.isOwner, // owner account
          roleInTender: ["manager", "owner"].includes(this.role.userRole)
        };
        break;
      }
      case "editContacts": {
        this.checks = {
          isOwner: this.role.isOwner, // owner account
          roleInTender: ["manager", "owner"].includes(this.role.userRole)
        };
        break;
      }
      case "editIntroduction": {
        this.checks = {
          isOwner: this.role.isOwner, // owner account
          roleInTender: ["manager", "owner"].includes(this.role.userRole)
        };
        break;
      }
      case "editRequirement": {
        this.checks = {
          isOwner: this.role.isOwner, // owner account
          roleInTender: ["manager", "owner"].includes(this.role.userRole),
          status: ["draft"].includes(this.status)
        };
        break;
      }
      case "editTenderFaq": {
        this.checks = {
          isOwner: this.role.isOwner, // owner account
          userRole: ["manager", "owner"].includes(this.role.userRole),
          status: ["draft", "open"].includes(this.status)
        };
        break;
      }
      case "editScope": {
        this.checks = {
          isOwner: this.role.isOwner, // owner account
          roleInTender: ["manager", "owner"].includes(this.role.userRole),
          status: ["draft"].includes(this.status)
        };
        break;
      }
      case "editData": {
        this.checks = {
          isOwner: this.role.isOwner, // owner account
          roleInTender: ["manager", "owner"].includes(this.role.userRole),
          status: ["draft"].includes(this.status)
        };
        break;
      }
      case "editProfile": {
        this.checks = {
          isOwner: this.role.isOwner, // owner account
          roleInTender: ["manager", "owner"].includes(this.role.userRole),
          status: ["draft"].includes(this.status)
        };
        break;
      }
      case "editPartners": {
        this.checks = {
          isOwner: this.role.isOwner, // owner account
          roleInTender: ["manager", "owner"].includes(this.role.userRole),
          status: ["draft", "open"].includes(this.status)
        };
        break;
      }
      case "generatePackages": {
        this.checks = {
          roleInTender: ["manager", "owner"].includes(this.role.userRole),

          // this.role.isOwner, // owner account
          status: ["draft"].includes(this.status),
          scopeExists: !!this.tender.scope
        };
        break;
      }
      case "modifyTenderSettings": {
        this.checks = {
          isOwner: this.role.isOwner, // owner account
          roleInTender: ["manager", "owner"].includes(this.role.userRole),
          status: ["draft"].includes(this.status)
        };
        break;
      }
      case "placeBid": {
        const NDArequired = get(this.tender, ["params", "NDA", "required"]);
        const NDAaccepted = get(this.myBid, ["NDAresponse", "accepted"]);

        this.checks = {
          isBidder: this.role.isBidder, // bidder account
          status: ["open"].includes(this.status),
          NDApassed: !NDArequired || (NDArequired && NDAaccepted)
        };
        break;
      }
      default:
        this.allowed = false;
    }

    this.checkAllowed();
    return this;
  }
}

export { CheckTenderSecurity };
