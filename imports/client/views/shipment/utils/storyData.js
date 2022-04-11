import shipments from "/imports/api/_jsonSchemas/fixtures/data.shipments.json";

const shipData = shipments[0];

export const security = {
  isOwner: true,
  isShipper: true,
  isCarrier: false,
  isProvider: false,
  isPartner: false,

  isVisible: true,

  canCancelShipment: true
};

export const shipment = {
  ...shipData,
  id: shipData._id
};
