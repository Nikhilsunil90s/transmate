export const getRoleForShipment = (shipment, accountId) => {
  // let status = oPath(["status"], shipment);

  if (!shipment) {
    return "unknown";
  }

  if (shipment.accountId === accountId) {
    return "owner";
  }
  if (shipment.shipperId === accountId) {
    return "shipper";
  }
  if (shipment.consigneeId === accountId) {
    return "consignee"; // e.g. a warehouse etc
  }
  if ((shipment.carrierIds || []).includes(accountId)) {
    return "carrier";
  }
  if ((shipment.providerIds || []).includes(accountId)) {
    return "provider";
  }

  return "stranger";
};

export const getRoleForShipmentObj = (shipment, accountId) => {
  return {
    isOwner: shipment.accountId === accountId,
    isShipper: shipment.shipperId === accountId,
    isConsignee: shipment.consigneeId === accountId,
    icCarrier: (shipment.carrierIds || []).includes(accountId),
    isProvider: (shipment.providerIds || []).includes(accountId),
    isActiveStakeholder:
      shipment.accountId === accountId ||
      shipment.shipperId === accountId ||
      (shipment.carrierIds || []).includes(accountId)
  };
};
