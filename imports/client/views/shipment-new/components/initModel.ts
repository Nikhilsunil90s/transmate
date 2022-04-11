const getLocation = location => {
  if (location?.locode) return { id: location.locode, type: "locode" };
  if (location?.addressId) return { id: location.addressId, type: "address" };
  return {};
};

export const initModel = shipment => ({
  pickupLocation: getLocation(shipment?.pickup?.location),
  ...(shipment?.pickup?.date ? { pickupDate: shipment.pickup.date } : {}),
  deliveryLocation: getLocation(shipment?.delivery?.location),
  ...(shipment?.delivery?.date ? { deliveryDate: shipment.delivery.date } : {})
});
