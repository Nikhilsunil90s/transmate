import { CheckShipmentSecurity } from "/imports/utils/security/checkUserPermissionForShipment";
import { CheckItemSecurity } from "/imports/utils/security/checkUserPermissionsForShipmentItem";

export function initializeSecurity({ shipment, context }) {
  const { userId, accountId } = context;
  const srv = new CheckShipmentSecurity({ shipment }, { accountId, userId });
  srv.setContext(context);
  const itemCheck = new CheckItemSecurity({ shipment }, { accountId, userId });
  itemCheck.setContext(context);
  return {
    check: srv,
    itemCheck,
    isOwner: srv.role?.isOwner,
    isShipper: srv.role?.isShipper,
    isCarrier: srv.role?.isCarrier,
    isProvider: srv.role?.isProvider,
    isPartner: srv.role?.isPartner,

    isVisible: srv.can({ action: "viewShipment" }).check(),

    canCancelShipment: srv.can({ action: "cancelShipment" }).check(),
    canUnCancelShipment: srv.can({ action: "unCancelShipment" }).check(),
    canEditReferences: srv.can({ action: "editReferences" }).check(),
    canUpdateTags: srv.can({ action: "updateTags" }).check(),
    canEditPartners: srv.can({ action: "editPartners" }).check(),
    canEditNotes: srv.can({ action: "editNotes" }).check(),
    canViewCostSection: srv.can({ action: "viewCostSection" }).check(),
    canEditBilling: srv.can({ action: "editBilling" }).check(),
    canSelectCarrier: srv.can({ action: "selectCarrier" }).check(),
    canAddBaseCost: srv.can({ action: "addBaseCost" }).check(),
    canAddManualCost: srv.can({ action: "addManualCost" }).check(),
    canResetCarrier: srv.can({ action: "resetCosts" }).check(),
    canEditCostParams: srv.can({ action: "editCostParams" }).check(),
    canAddDocuments: srv.can({ action: "addDocuments" }).check(),
    canUnlinkPriceRequest: priceRequestStatus =>
      srv
        .can({
          action: "unlinkPriceRequest",
          data: { status: priceRequestStatus }
        })
        .check(),
    canEditNonConformances: true,

    // items:
    canDragItems: itemCheck.can({ action: "dragItemsInShipment" }).check(),
    canEditItems: itemCheck.can({ action: "updateItemInShipment" }).check(),
    canAddItem: itemCheck.can({ action: "addItemToShipment" }).check(),
    canEditItemReferences: itemCheck
      .can({ action: "addReferencesToItem" })
      .check(),
    canEditWeights: itemCheck
      .can({ action: "editWeightAndDimensions" })
      .check(),

    canViewCostLabel: cost =>
      srv.can({ action: "seeApprovedDeclinedLabel", data: { cost } }).check(),
    canApproveDecline: cost =>
      srv.can({ action: "approveDeclineCost", data: { cost } }).check(),
    canRemoveManualCost: cost =>
      srv.can({ action: "removeManualCost", data: { cost } }).check()
  };
}
