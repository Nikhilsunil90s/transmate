import { Shipment } from "../../Shipment";

import { generateShipmentData } from "../data/shipmentTestData";

// not used yet..
export const prepareDataMass = async ({ accountId, shipperId, carrierId }) => {
  const data = generateShipmentData({
    accountId,
    shipperId,
    carrierId
  });
  const shipmentId = await Shipment._collection.insert(data);
  return shipmentId;
};
