import get from "lodash.get";
import { SecurityCheck } from "./_securityCheck";
import { PriceList } from "/imports/api/pricelists/PriceList";

export const dbFields = {
  creatorId: 1,
  customerId: 1,
  carrierId: 1,
  status: 1,
  validTo: 1
};

const getRoleForPriceList = (priceList = {}, accountId) => {
  return {
    isOwner: priceList.creatorId === accountId,
    isCustomer: priceList.customerId === accountId,
    isCarrier: priceList.carrierId === accountId,
    isBidder:
      priceList.creatorId !== accountId && priceList.carrierId === accountId
  };
};

/** required fields
 * @param {Object} priceList
 * @param {String} priceList.status
 * @param {Boolean} priceList.isExpired // apollo projection!!
 * @param {Date} priceList.validTo
 * @param {String} priceList.creatorId
 * @param {String} priceList.customerId
 * @param {String} priceList.carrierId
 * @param {Object} priceList.settings
 */
class CheckPriceListSecurity extends SecurityCheck {
  constructor({ priceList }, { userId, accountId }) {
    super({ userId, accountId });

    // don't use any context here, use setContext if needed
    // specific here:
    this.priceList = PriceList.init(priceList);
    this.status = this.priceList.status;

    this.isExpired =
      this.priceList.expired === undefined
        ? this.priceList.isExpired() // model method
        : this.priceList.expired;
  }

  getRole() {
    return getRoleForPriceList(this.priceList, this.accountId);
  }

  // eslint-disable-next-line no-unused-vars
  /**
   * @param {{action: string, data?: any}} param0
   */
  can({ action }) {
    this.role = this.getRole();
    this.action = action;
    this.multiCheck = false;
    switch (action) {
      case "updatePriceList":
        this.checks = {
          isOwner: this.role.isOwner,
          status: ["draft", "requested"].includes(this.status),
          userHasRole: this.checkUserHasRoles(["core-priceList-update"])
        };
        break;
      case "addAttachment":
        this.checks = {
          isOwner: this.role.isOwner,
          userHasRole: this.checkUserHasRoles(["core-priceList-addAttachment"])
        };
        break;
      case "deleteAttachment":
        this.checks = {
          isOwner: this.role.isOwner,
          userHasRole: this.checkUserHasRoles(["core-priceList-addAttachment"])
        };
        break;
      case "duplicatePriceList":
        // depends on what context: -> if override "from other account" -> should not be owner
        this.checks = {
          userHasRole: this.checkUserHasRoles(["core-priceList-create"])
        };
        break;

      // grid
      case "canEdit": // master editing the grid
      case "canEditCharge":
      case "canEditLaneInGrid":
      case "canEditEquipmentInGrid":
      case "canEditVolumesInGrid":
      case "canModifyConversions":
      case "canModifyGridStructure":
      case "canAddGridComments":
      case "canAddFuelModel":
      case "canAddMasterNotes":
        this.checks = {
          status: ["draft", "requested"].includes(this.status),
          isOwner: this.role.isOwner
        };
        break;
      case "canModifyLeadTime": {
        this.checks = {
          ownerCondition: {
            status: ["draft", "requested"].includes(this.status),
            isOwner: this.role.isOwner
          },
          fillingOut: {
            status: ["requested"].includes(this.status),
            isBidder: this.role.isBidder
          }
        };
        this.multiCheck = true;
        break;
      }

      // fill out:
      case "canEditRateInGrid": {
        this.checks = {
          ownerCondition: {
            status: ["draft", "requested"].includes(this.status),
            isOwner: this.role.isOwner
          },
          fillingOut: {
            status: ["requested"].includes(this.status),
            isBidder: this.role.isBidder
          }
        };
        this.multiCheck = true;
        break;
      }
      case "canEditRateInList": {
        this.checks = {
          ownerCondition: {
            status: ["draft", "requested"].includes(this.status),
            isOwner: this.role.isOwner
          },
          fillingOut: {
            status: ["requested"].includes(this.status),
            bidderAccess: get(this.priceList, [
              "settings",
              "canEditAdditionalCosts"
            ]),
            isBidder: this.role.isBidder
          }
        };
        this.multiCheck = true;
        break;
      }
      case "canEditCurrencyInGrid": {
        this.checks = {
          isBidder: this.role.isBidder,
          statusIsRequested: ["requested"].includes(this.status),
          bidderAccess: get(this.priceList, ["settings", "canEditCurrency"])
        };
        break;
      }
      case "canEditMultiplierInGrid": {
        this.checks = {
          isBidder: this.role.isBidder,
          statusIsRequested: ["requested"].includes(this.status),
          bidderAccess: get(this.priceList, ["settings", "canEditMultiplier"])
        };
        break;
      }

      // actions on pricelist (results in buttons being hided or shown)
      // release = I am offering to a client & I release it to him...
      case "canRelease":
      case "canBeReleased": {
        this.checks = {
          status: ["requested"].includes(this.status),
          notGlobal: get(this, ["priceList", "type"]) !== "global",
          notExpired: !this.isExpired,
          isBidder: this.role.isBidder,
          hasPartnersSet:
            !!this.priceList.carrierId && !!this.priceList.customerId
        };
        break;
      }
      case "canBeDeclined":
      case "canBeApproved":
        this.checks = {
          status: ["for-approval"].includes(this.status),
          notExpired: !this.isExpired,
          isCustomer: this.role.isCustomer
        };
        break;
      case "canBeSetBackToDraft": {
        // owner that is putting its own pricelist into draft:
        this.checks = {
          ownerCondition: {
            status: ["active", "for-approval", "requested"].includes(
              this.status
            ),
            isOwner: this.role.isOwner
          },

          // carrier that has a global pricelist and wants to put it in draft:
          bidderConditionGlobal: {
            status: ["active"].includes(this.status),
            isGlobal: get(this, ["priceList", "type"]) === "global",
            isOwner: this.role.isOwner
          },

          // bidder that has put in for-approval and wants to edit -> to requested
          bidderCondition: {
            status: ["for-approval", "active"].includes(this.status),
            isNotGlobal: get(this, ["priceList", "type"]) !== "global",
            isBidder: this.role.isBidder
          }
        };
        this.multiCheck = true;

        break;
      }
      case "canBeDeactivated":
        this.checks = {
          status: ["active"].includes(this.status),
          notExpired: !this.isExpired,
          isCustomer: this.role.isOwner || this.role.isCustomer
        };
        break;
      case "canBeActivated":
        this.checks = {
          status: ["inactive", "draft"].includes(this.status),
          notExpired: !this.isExpired,
          isOwner: this.role.isOwner,
          hasPartnersSet:
            !!this.priceList.carrierId && !!this.priceList.customerId
        };
        break;
      case "canBeArchived":
        this.checks = {
          isInactive:
            ["inactive", "draft"].includes(this.status) || this.isExpired,
          isOwner: this.role.isOwner
        };
        break;
      case "canBeDeleted":
        this.message =
          "Only the account that created this price list can delete it.";
        this.checks = {
          status: ["draft", "requested"].includes(this.status),
          isOwner: this.role.isOwner,
          userHasRole: this.checkUserHasRoles(["core-priceList-remove"])
        };
        break;
      default:
        this.allowed = false;
    }

    this.checkAllowed();
    return this;
  }
}

export { CheckPriceListSecurity };
