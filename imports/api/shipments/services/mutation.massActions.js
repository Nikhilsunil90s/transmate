import SecurityChecks from "/imports/utils/security/_security";

import { Shipment } from "/imports/api/shipments/Shipment";
import { ShipmentService } from "./shipments";
import { copyShipment } from "./mutation.copyShipment";

import { requiredDbFields } from "/imports/utils/security/checkUserPermissionForShipment";

export const massAction = ({ accountId, userId }) => ({
  accountId,
  userId,
  errors: [],
  success: [],
  newIds: [],
  async go({ shipmentIds, action }) {
    await Promise.all(
      shipmentIds.map(async shipmentId => {
        try {
          const shipment = await Shipment.first(shipmentId, {
            fields: requiredDbFields
          });
          SecurityChecks.checkIfExists(shipment);

          switch (action) {
            case "cancel": {
              const srv = await new ShipmentService({
                shipment,
                accountId,
                userId
              });
              await srv.checkPermission("cancelShipment");
              await srv.cancel();

              break;
            }
            case "archive": {
              const srv = new ShipmentService({
                shipment,
                accountId,
                userId
              });
              await srv.checkPermission("archiveShipment");
              await srv.archive();

              break;
            }
            case "delete": {
              const srv = new ShipmentService({ shipment, accountId, userId });
              await srv.checkPermission("deleteShipment");
              await srv.delete();
              break;
            }
            case "copy": {
              const srv = copyShipment({ accountId, userId });
              await srv.makeCopy({ shipmentId, options: { keepDates: true } });
              srv.notifications();
              const newId = srv.get();
              this.newIds.push(newId);
              break;
            }
            default:
              throw new Error("action unkown");
          }
          this.success.push(shipmentId);
        } catch (e) {
          console.error(e);
          this.errors.push({ shipmentId, error: e.reason });
        }
      })
    );

    return this;
  },
  getResponse() {
    return { success: this.success, errors: this.errors, newIds: this.newIds };
  }
});
