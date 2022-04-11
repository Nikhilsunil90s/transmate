import get from "lodash.get";
import { JobManager } from "../../../utils/server/job-manager.js";
import { Shipment } from "/imports/api/shipments/Shipment";
import { Stage } from "/imports/api/stages/Stage.js";

import {
  CheckShipmentSecurity,
  requiredDbFields
} from "/imports/utils/security/checkUserPermissionForShipment";
import SecurityChecks from "/imports/utils/security/_security";

export const updateShipmentEta = ({ accountId, userId }) => ({
  accountId,
  userId,
  async init({ shipmentId }) {
    this.shipmentId = shipmentId;
    this.shipment = await Shipment.first(shipmentId, {
      fields: { ...requiredDbFields, references: 1 }
    });
    SecurityChecks.checkIfExists(this.shipment);

    const check = new CheckShipmentSecurity(
      {
        shipment: this.shipment
      },
      { accountId, userId }
    );
    await check.getUserRoles();

    // FIXME: make granular checks for fields + status
    check.can({ action: "updateShipment" }).throw();

    return this;
  },

  // FIXME: add test (triggered by the update)
  async addDelay(minutes) {
    const stages = await this.shipment.getStages();
    await Promise.all(
      stages.map(stage => {
        return Stage.init(stage).addDelay(minutes);
      })
    );
    return JobManager.post("shipment.delayed", this, {
      delay: minutes
    });
  },

  // FIXME: still used??
  // eslint-disable-next-line consistent-return
  async setEta(date) {
    // Find current stage (first one where the driver has not arrived yet)
    const currentStage = await Stage.first(
      {
        shipmentId: this.shipmentId,
        "dates.delivery.arrival.actual": null
      },
      { sort: { sequence: 1 } }
    );

    if (!currentStage) {
      return false;
    }
    const eta =
      get(currentStage, ["dates", "eta"]) ||
      get(currentStage, ["dates", "delivery", "arrival", "planned"]);

    if (!date) {
      return eta;
    }
    if (date.getTime() !== (eta != null ? eta.getTime() : undefined)) {
      await currentStage.update({
        "dates.eta": date
      });
      return JobManager.post("stage.eta", currentStage, {
        eta: date
      });
    }
  }
});
