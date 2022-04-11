/* eslint-disable no-use-before-define */
import get from "lodash.get";
import { SecurityCheck } from "./_securityCheck";
import { getRoleForShipment } from "./_checkRoleInShipment";
import { setIsSubset } from "/imports/utils/functions/fnArrayHelpers";

import { Shipment } from "/imports/api/shipments/Shipment";

// const debug = require("debug")("security:shipment");

export const requiredDbFields = {
  accountId: 1,
  carrierIds: 1,
  shipperId: 1,
  providerIds: 1,
  status: 1,
  access: 1,
  shipmentProjectInboundId: 1,
  shipmentProjectOutboundId: 1,
  number: 1,
  pickup: 1,
  delivery: 1
};

export const getRoleForShipm = (shipment = {}, accountId) => {
  return {
    isOwner: shipment.accountId === accountId,
    isShipper: shipment.shipperId === accountId,
    isCarrier: (shipment.carrierIds || []).includes(accountId),
    isProvider: (shipment.providerIds || []).includes(accountId),
    isPartner:
      shipment.shipperId === accountId ||
      (shipment.carrierIds || []).includes(accountId) ||
      (shipment.providerIds || []).includes(accountId)
  };
};
class CheckShipmentSecurity extends SecurityCheck {
  constructor({ shipment = {} }, { accountId, userId }) {
    super({ accountId, userId });

    // specific here:
    this.shipment = Shipment.init(shipment);
    this.access = shipment.access || [];
    this.status = get(shipment, ["status"]);
    this.role = getRoleForShipm(shipment, this.accountId);
    this.accountRoleInShipment = getRoleForShipment(shipment, this.accountId);
  }

  /** @param {{action: string; data?: any}} param0 */
  can({ action, data }) {
    this.multiCheck = false;

    // helpers
    this.action = action;
    const statusCheck = (opts = []) => {
      const msg = `Shipment status should be ${opts.join("/ ")}`;
      return this.ruleCheck([...opts].includes(this.status), msg);
    };

    switch (action) {
      case "createShipment":
        this.checks = {
          userHasRole: this.checkUserHasRoles(["core-shipment-create"])
        };
        break;
      case "cancelShipment": {
        this.checks = {
          status: ["draft"].includes(this.status),
          isOwner: this.ruleCheck(this.role.isOwner, "You should be owner"),
          userHasRole: this.checkUserHasRoles(["core-shipment-cancel"])
        };
        break;
      }

      // shipment admin can uncancel a shipment
      case "unCancelShipment": {
        this.checks = {
          status: ["canceled", "archived"].includes(this.status),
          isOwner: this.ruleCheck(this.role.isOwner, "You should be owner"),
          userHasRole: this.checkUserHasRoles(["admin"])
        };
        break;
      }
      case "archiveShipment": {
        this.checks = {
          isOwner: this.role.isOwner,
          userHasRole: this.checkUserHasRoles(["core-shipment-cancel"])
        };
        break;
      }
      case "deleteShipment": {
        this.checks = {
          status: ["draft"].includes(this.status),
          isOwner: this.role.isOwner,
          userHasRole: this.checkUserHasRoles(["core-shipment-cancel"])
        };
        break;
      }
      case "updateShipment": {
        // if shipment is in draft, the account is owner & i am a planner/admin -> any field
        // if shipment is not in draft, the account is owner & i am a planner/admin -> certain fields
        // if shipment is in draft, the carrier can update specific fields
        const updateKeys = Object.keys(this.data || {});
        this.checks = {
          ownerCondition: {
            isOwner: this.role.isOwner,
            status: ["draft"].includes(this.status),
            userHasRole: this.checkUserHasRoles(["core-shipment-update"])
          },
          ownerCondition2: {
            isOwner: this.role.isOwner,
            status: !["canceled"].includes(this.status),
            userHasRole: this.checkUserHasRoles(["core-shipment-update"]),
            fields: setIsSubset({
              subsetArr: updateKeys,
              masterArr: ["references", "notes", "nonConformances"]
            })
          },
          carrierCondition: {
            isCarrier: this.role.isCarrier,
            userHasRole: this.checkUserHasRoles(["core-shipment-update"]),
            fields: setIsSubset({
              subsetArr: updateKeys,
              masterArr: ["references", "notes", "nonConformances"]
            })
          }
        };
        this.multiCheck = true;
        break;
      }

      /** update location in shipment (e.g. for parcels) */
      case "updateLocation": {
        this.checks = {
          isOwner: this.role.isOwner,
          status: ["draft"].includes(this.status),
          userHasRole: this.checkUserHasRoles(["core-shipment-update"])
        };
        break;
      }
      case "editPartners":
        this.checks = {
          isOwner: this.role.isOwner,
          userHasRole: this.checkUserHasRoles(["core-shipment-update"])
        };
        break;
      case "updateTags":
        this.checks = {
          isOwner: this.role.isOwner,
          userHasRole: this.checkUserHasRoles(["core-shipment-update"])
        };
        break;
      case "updateRequestedDates":
        this.checks = {
          status: ["draft"].includes(this.status),
          isOwner: this.role.isOwner,
          userHasRole: this.checkUserHasRoles(["core-shipment-update"])
        };
        break;
      case "selectCarrier":
        this.checks = {
          status: ["draft"].includes(this.status),
          isOwner: this.role.isOwner,
          userHasRole: this.checkUserHasRoles(["core-shipment-update"])
        };
        break;
      case "viewShipment": {
        this.checks = {
          owner: { isOwner: this.role.isOwner },
          shipper: {
            isShipper: this.role.isShipper,
            status: !["draft", "canceled"].includes(this.status)
          },
          provider: {
            isProvider: this.role.isProvider,
            status: !["draft", "canceled"].includes(this.status)
          },
          carrier: {
            isCarrier: this.role.isCarrier,
            status: !["draft", "canceled"].includes(this.status)
          },
          bidder: {
            // is my accountid in the accessArray?
            accessArray: !!this.access.find(
              ({ accountId }) => accountId === this.accountId
            )
          }
        };
        this.multiCheck = true;
        break;
      }
      case "viewCostSection": {
        this.checks = {
          ownerCondition: {
            isOwner: this.role.isOwner,
            userHasRole: this.checkUserHasRoles(["core-shipment-viewCosts"])
          },
          carrierCondition: {
            isCarrier: this.role.isCarrier,
            status: !["draft", "canceled"].includes(this.status),
            userHasRole: this.checkUserHasRoles(["core-shipment-viewCosts"])
          }
        };
        this.multiCheck = true;
        break;
      }
      case "editBilling": {
        this.checks = {
          isOwner: this.role.isOwner,
          userHasRole: this.checkUserHasRoles(["core-shipment-viewCosts"])

          // hasFeature: ["shipment-billing"] -> done in a separate check
        };
        break;
      }
      case "addBaseCost": {
        this.errorMessage =
          "You are not allowed to add a base cost to this shipment";
        const { costs = [] } = this.shipment; // !! UI fetches projeced costs array!!
        const hasCalcCosts = costs
          .map(({ source }) => source)
          .includes("priceList");
        const hasBaseCosts = costs.some(
          ({ isManualBaseCost }) => isManualBaseCost
        );
        const carrierIsSelected = (this.shipment.carrierIds || []).length > 0;
        this.checks = {
          isOwner: this.role.isOwner,
          noCalculatedCosts: !hasCalcCosts,
          noManualBaseCosts: !hasBaseCosts,
          carrierIsSelected,
          userHasRole: this.checkUserHasRoles(["core-shipment-addBaseCost"])
        };
        break;
      }
      case "addManualCost": {
        const carrierIsSelected = (this.shipment.carrierIds || []).length > 0;
        this.errorMessage =
          "You are not allowed to add a cost to this shipment";
        this.multiCheck = true;
        this.checks = {
          ownerCondition: {
            isOwner: this.role.isOwner,
            carrierIsSelected,
            userHasRole: this.checkUserHasRoles(["core-shipment-addManualCost"])
          },
          carrierCondition: {
            isCarrier: this.role.isCarrier,
            userHasRole: this.checkUserHasRoles(["core-shipment-addManualCost"])
          }
        };
        break;
      }
      case "updateManualCost": {
        // if user has created it and wants to update it
        this.errorMessage = "You are not allowed to update this cost";
        const userId = get(data, ["cost", "added", "by"]);
        const source = get(data, ["cost", "source"]);
        this.checks = {
          userHasCreated: userId === this.userId,
          userHasRole: this.checkUserHasRoles([
            "core-shipment-updateManualCost"
          ]),
          isManual: source === "input"
        };
        break;
      }
      case "removeManualCost": {
        this.errorMessage = "You are not allowed to remove this cost";

        // if user has created it and wants to remove it
        const source = get(data, ["cost", "source"]);
        const isInvoice = get(data, ["cost", "isInvoice"]); // do not allow items from invoice side overview to be deleted

        this.checks = {
          userHasRole: this.checkUserHasRoles([
            "core-shipment-updateManualCost"
          ]),
          manualCostSource: ["input", "invoice"].includes(source),
          isNotInvoice: !isInvoice
        };
        break;
      }
      case "approveDeclineCost": {
        this.errorMessage = "You are not allowed to approve/decline this cost";

        // const userId = get(data,["cost", "added", "by"]);
        const forApproval = get(data, ["cost", "forApproval"]);
        this.checks = {
          forApproval,
          isOwner: this.role.isOwner,
          userHasRole: this.checkUserHasRoles([
            "core-shipment-approveDeclineCost"
          ])
        };
        break;
      }
      case "seeApprovedDeclinedLabel": {
        this.checks = {
          canSee: true
        };
        break;
      }
      case "addCostFromInvoice": {
        this.errorMessage =
          "You are not allowed to add invoice cost to this shipment";
        const source = get(data, ["cost", "source"]);
        const addedToShipment = get(data, ["cost", "addedToShipment"]);
        const isInvoice = get(data, ["cost", "isInvoice"]);
        this.checks = {
          isInvoiceSource: source === "invoice",
          isInvoice,
          notAddedToShipment: !addedToShipment,
          isOwner: this.role.isOwner,
          userHasRole: this.checkUserHasRoles([
            "core-shipment-addCostFromInvoice"
          ])
        };
        break;
      }
      case "resetCosts": {
        this.checks = {
          status: ["draft"].includes(this.status),
          hasCarrierAllocated: get(this.shipment, ["carrierIds", "length"]) > 0,
          isOwner: this.role.isOwner,
          userHasRole: this.checkUserHasRoles(["core-shipment-update"])
        };
        break;
      }
      case "editCostParams": {
        this.checks = {
          isOwner: this.role.isOwner,
          userHasRole: this.checkUserHasRoles(["core-shipment-update"])
        };
        break;
      }
      case "unlinkPriceRequest": {
        // data = {status}; the status of the priceRequest
        this.checks = {
          priceRequestStatus:
            data?.status && !["requested"].includes(data.status),
          isOwner: this.role.isOwner,
          userHasRole: this.checkUserHasRoles(["admin"]) // only admin!
        };
        break;
      }

      // UI rules
      case "editItems": {
        this.checks = {
          status: ["draft"].includes(this.status),
          isOwner: this.ruleCheck(this.role.isOwner, "You should be owner"),
          userHasRole: this.checkUserHasRoles(["core-shipment-editItems"])
        };
        break;
      }
      case "editEquipments": {
        this.checks = {
          status: statusCheck(["draft"]),
          isOwner: this.ruleCheck(this.role.isOwner, "You should be owner"),
          userHasRole: this.checkUserHasRoles(["core-shipment-editEquipments"])
        };
        break;
      }
      case "editNotes": {
        this.checks = {
          status: statusCheck(["draft", "scheduled", "planned", "completed"]),
          isOwner: this.ruleCheck(this.role.isOwner, "You should be owner"),
          userHasRole: this.checkUserHasRoles(["core-shipment-editNotes"])
        };
        break;
      }
      case "editReferences": {
        this.checks = {
          status: statusCheck([
            "draft",
            "scheduled",
            "planned",
            "partial",
            "completed"
          ]),
          roleInShipment:
            this.role.isOwner || this.role.isShipper || this.role.isCarrier,
          userHasRole: this.checkUserHasRoles(["core-shipment-editReferences"])
        };
        break;
      }
      case "addDocuments": {
        this.checks = {
          ownerCondition: { isOwner: this.role.isOwner },
          partnerCondition: { isPartner: this.role.isPartner }
        };
        this.multiCheck = true;
        break;
      }
      case "editDocument": {
        // data = doc
        // user has added the document || shipment owner:
        this.checks = {
          ownerCondition: {
            isOwner: this.role.isOwner,
            userHasRole: this.checkUserHasRoles(["core-shipment-editDocuments"])
          },
          docCreatorCondition: {
            isDocOwner: get(data, ["created", "by"]) === this.userId
          }
        };
        this.multiCheck = true;
        break;
      }
      default:
        this.allowed = false;
    }

    this.checkAllowed();
    return this;
  }
}

export { CheckShipmentSecurity };
