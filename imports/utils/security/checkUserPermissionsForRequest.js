import get from "lodash.get";
import { SecurityCheck } from "./_securityCheck";

// roles for priceRequest:
// "core-priceRequest-createForShipment",
// "core-priceRequest-create",
// "core-priceRequest-update",
// "core-priceRequest-edit-requirements",
// "core-priceRequest-edit-settings",
// "core-priceRequest-remove"

export const getRoleInRequest = (requestDoc = {}, accountId) => {
  return {
    isOwner: requestDoc.creatorId === accountId,
    isCustomer: requestDoc.customerId === accountId,
    isBidder:
      requestDoc.creatorId !== accountId &&
      requestDoc.bidders &&
      !!requestDoc.bidders.find(({ accountId: bidAcc }) => bidAcc === accountId)
  };
};

class CheckPriceRequestSecurity extends SecurityCheck {
  constructor({ request, update }, { accountId, userId }) {
    super({ accountId, userId });

    // specific here:
    this.request = request || {};
    this.status = get(request, ["status"]);
    this.update = update || {};

    this.myBid = (this.request.bidders || []).find(
      ({ accountId: bidderId }) => bidderId === this.accountId
    );
    this.role = getRoleInRequest(this.request, this.accountId);
    this.isExpired = !(request && new Date(request.dueDate) > new Date());
  }

  can({ action, data = {} }) {
    switch (action) {
      case "createRequest":
        this.errorMessage = "You are not allowed to create a price request";
        this.checks = {
          userHasRole: this.checkUserHasRoles(["core-priceRequest-create"])
        };
        break;
      case "createRequestForShipment": {
        const ownerOfShipment =
          get(data, ["shipment", "accountId"]) === this.accountId;
        this.errorMessage = "You are not allowed to create a price request";
        this.checks = {
          isShipmentOwner: ownerOfShipment,
          userHasRole: this.checkUserHasRoles([
            "core-priceRequest-createForShipment"
          ])
        };
        break;
      }
      case "editRequirements":
        this.checks = {
          isOwner: this.role.isOwner,
          status: ["draft", "requested"].includes(this.status),
          userHasRole: this.checkUserHasRoles([
            "core-priceRequest-edit-requirements"
          ])
        };
        break;
      case "viewSettings":
        this.checks = {
          isOwner: this.role.isOwner,
          userHasRole: this.checkUserHasRoles([
            "core-priceRequest-edit-settings"
          ])
        };
        break;
      case "postponeDeadline":
        this.checks = {
          isOwner: this.role.isOwner,
          isRunningPriceRequest: ["requested"].includes(this.status),
          userHasRole: this.checkUserHasRoles(["core-priceRequest-update"])
        };
        break;
      case "viewAnalytics":
      case "viewPartners":
        this.checks = {
          isOwner: this.role.isOwner
        };
        break;
      case "editTitle":
      case "editSettings":
      case "editItems":
      case "addItems": {
        this.errorMessage =
          "You are not allowed to add items to this price request";
        this.checks = {
          status: ["draft"].includes(this.status),
          isOwner: this.role.isOwner,
          userHasRoles: this.checkUserHasRoles(["core-priceRequest-update"])
        };
        break;
      }
      case "editMasterNote":
      case "addPartners": {
        this.errorMessage =
          "You are not allowed to add partners to this price request";
        this.checks = {
          status: ["draft", "requested"].includes(this.status),
          isOwner: this.role.isOwner,
          userHasRoles: this.checkUserHasRoles(["core-priceRequest-update"])
        };
        break;
      }
      case "bidOnRequest": {
        // user can see the bidding block.
        this.errorMessage = "You are not allowed to bid on this price request";
        this.checks = {
          status: ["draft", "requested"].includes(this.status),
          isBidder: this.role.isBidder
        };
        break;
      }
      case "placeBid": {
        // user can see the bidding block.
        this.errorMessage = "You are not allowed to bid on this price request";
        this.checks = {
          status: ["draft", "requested"].includes(this.status),
          isBidder: this.role.isBidder
        };
        break;
      }

      case "seeTokenLink": {
        // user can see the bidding block.
        this.errorMessage = "You are not allowed to see the token link";
        this.checks = {
          status: ["requested"].includes(this.status),

          // isOwner: this.role.isOwner,
          isCustomer: this.role.isCustomer,
          userHasRoles: this.checkUserHasRoles(["core-priceRequest-see-tokens"])
        };
        break;
      }

      case "isOwner": {
        // user is owner.
        this.errorMessage = "You are not a Owner!";
        this.checks = {
          isOwner: this.role.isOwner
        };
        break;
      }

      // controls buttons & master features:
      case "canBeRequested": {
        this.checks = {
          status: ["draft"].includes(this.status),
          isNotExpired: !this.isExpired,
          isOwner: this.role.isOwner,
          userHasRole: this.checkUserHasRoles(["core-priceRequest-update"]),

          hasBidders: get(this, ["request", "bidders", "length"]) > 0,
          hasBiddingItems: get(this, ["request", "items", "length"]) > 0
        };
        break;
      }
      case "canBeSetBackToDraft":
        this.checks = {
          status: ["requested", "archived", "cancelled", "deleted"].includes(
            this.status
          ),
          isOwner: this.role.isOwner,
          userHasRole: this.checkUserHasRoles(["core-priceRequest-update"])
        };
        break;
      case "canBeDeactivated":
        // sets to status closed
        this.checks = {
          status: ["requested"].includes(this.status),
          isOwner: this.role.isOwner,
          userHasRole: this.checkUserHasRoles(["core-priceRequest-update"])
        };
        break;
      case "canBeArchived":
        this.checks = {
          userHasRole: this.checkUserHasRoles(["core-priceRequest-update"]),
          status: ["draft", "closed", "requested", "canceled"].includes(
            this.status
          ),
          isOwner: this.role.isOwner
        };
        break;
      case "canBeDeleted":
        this.checks = {
          userHasRole: this.checkUserHasRoles(["core-priceRequest-remove"]),
          status: ["draft", "requested", "cancelled"].includes(this.status),
          isOwner: this.role.isOwner
        };
        break;
      default:
        this.allowed = false;
    }

    this.checkAllowed();

    return this;
  }
}

export { CheckPriceRequestSecurity };

export default CheckPriceRequestSecurity;
