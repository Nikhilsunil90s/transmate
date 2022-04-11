export const stringifyBlackbox = shipment => {
  if (shipment.edi) {
    shipment.edi = JSON.stringify(shipment.edi);
  }
  if (shipment.meta) {
    shipment.meta = JSON.stringify(shipment.meta);
  }
  if (shipment.seaLane) {
    shipment.seaLane = JSON.stringify(shipment.seaLane);
  }
  if (shipment.tracking && shipment.tracking.references) {
    shipment.tracking.references = JSON.stringify(shipment.tracking.references);
  }
  if (shipment.updates && shipment.updates.data) {
    shipment.updates.data = JSON.stringify(shipment.updates.data);
  }
  if (shipment.costs && shipment.costs.meta) {
    shipment.costs.meta = JSON.stringify(shipment.costs.meta);
  }
  return shipment;
};
