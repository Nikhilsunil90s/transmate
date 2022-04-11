import { JobManager } from "/imports/utils/server/job-manager.js";

import { Shipment } from "/imports/api/shipments/Shipment";

export const documentAddedHook = async ({ document }) => {
  if (document.shipmentId) {
    const shipment = await Shipment.first({
      _id: document.shipmentId
    });
    shipment.addUpdate("document", {
      id: document.id
    });
  }
  return null;
};

JobManager.on("document.added", "shipmentUpdate", async notification => {
  const document = notification.object;
  return documentAddedHook({ document });
});
