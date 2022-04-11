import { JobManager } from "/imports/utils/server/job-manager.js";

import { Shipment } from "/imports/api/shipments/Shipment";

JobManager.on("non-conformance.added", "shipmentUpdate", async notification => {
  const nonConformance = notification.object;
  const shipment = await Shipment.first(
    {
      _id: nonConformance.shipmentId
    },
    {
      fields: { _id: 1, accountId: 1 }
    }
  );
  await shipment.addUpdate("non-conformance", {
    id: nonConformance.id
  });
  return "snipment Updated";
});
