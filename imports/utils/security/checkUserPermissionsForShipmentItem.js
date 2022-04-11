/* eslint-disable no-use-before-define */
import get from "lodash.get";
import { SecurityCheck } from "/imports/utils/security/_securityCheck";
import {
  getRoleForShipm,
  requiredDbFields
} from "./checkUserPermissionForShipment";

// from shipment document:
export const requiredShipmentFields = {
  accountId: 1,
  carrierIds: 1,
  shipperId: 1,
  providerIds: 1,
  status: 1
};

export const SHIPMENT_FIELDS = {
  ...requiredDbFields
};

/** security checks for Shipment Items [nested] */
class CheckItemSecurity extends SecurityCheck {
  constructor({ shipment }, { accountId, userId }) {
    super({ accountId, userId });

    // specific here:
    this.shipment = shipment || {};
    this.shipmentStatus = get(shipment, ["status"]);
    this.role = getRoleForShipm(shipment, this.accountId);
  }

  can({ action }) {
    switch (action) {
      case "addItemToShipment":
        this.checks = {
          shipmentStatus: ["draft"].includes(this.shipmentStatus),
          isOwner: this.ruleCheck(this.role.isOwner, "You should be owner"),
          userRole: this.checkUserHasRoles(["core-shipment-editItems"])
        };
        break;
      case "dragItemsInShipment":
        this.checks = {
          shipmentStatus: ["draft"].includes(this.shipmentStatus),
          isOwner: this.ruleCheck(this.role.isOwner, "You should be owner"),
          userRole: this.checkUserHasRoles(["core-shipment-editItems"])
        };
        break;
      case "updateItemInShipment":
        this.checks = {
          shipmentStatus: ["draft"].includes(this.shipmentStatus),
          isOwner: this.ruleCheck(this.role.isOwner, "You should be owner"),
          userRole: this.checkUserHasRoles(["core-shipment-editItems"])
        };
        break;
      case "addReferencesToItem":
        this.checks = {
          isStakeHolder: this.role.isOwner || this.role.isCarrier,
          userRole: this.checkUserHasRoles(["core-shipment-editItems"])
        };
        break;
      case "editWeightAndDimensions":
        this.checks = {
          isStakeHolder: this.role.isOwner || this.role.isCarrier,
          userRole: this.checkUserHasRoles(["core-shipment-editItems"])
        };
        break;
      default:
        this.allowed = false;
    }

    this.checkAllowed();
    return this;
  }
}

export { CheckItemSecurity };
