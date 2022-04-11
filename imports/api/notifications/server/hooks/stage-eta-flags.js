import { JobManager } from "/imports/utils/server/job-manager.js";

import { Shipment } from "/imports/api/shipments/Shipment";

// FIXME: triggered by shipment.setEta() -> not triggered anywhere??
JobManager.on("stage.eta", "Update", async notification => {
  const stage = notification.object;
  const shipment = await Shipment.check(stage.shipmentId);
  return shipment.updateFlags("eta-late");
});
