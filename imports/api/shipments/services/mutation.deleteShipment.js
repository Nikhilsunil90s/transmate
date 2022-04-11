import SecurityChecks from "/imports/utils/security/_security";
import { Shipment } from "/imports/api/shipments/Shipment";
import { Stage } from "/imports/api/stages/Stage";
import { ShipmentItem } from "/imports/api/items/ShipmentItem";

/** deletes shipment from db after a wrong import */

export const deleteShipment = ({ accountId, userId }) => ({
  accountId,
  userId,
  async delete({ shipmentId, strict }) {
    const shipment = await Shipment.check(shipmentId);

    if (strict) SecurityChecks.checkIfExists(shipment);

    if (shipment) {
      ShipmentItem._collection.remove({ shipmentId });
      Stage._collection.remove({ shipmentId });
      return shipment.deleteFlag();
    }
    return null;
  }
});
