export const getShipmentStakeholders = shipment => {
  return [
    ...new Set([
      shipment.accountId,
      shipment.shipperId,
      shipment.consigneeId,
      ...(shipment.carrierIds || []),
      ...(shipment.providerIds || [])
    ])
  ].filter(x => !!x);
};
