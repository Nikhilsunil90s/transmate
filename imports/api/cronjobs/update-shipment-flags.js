import { Shipment } from "../shipments/Shipment";
import { addCron } from "./cron";

addCron({
  name: "Update shipment flags that have external inputs",

  // schedule: "10 minutes",
  interval: 60 * 10,
  async job(cronLog = []) {
    // Tracking failed flag
    cronLog.push("update tracking failed!");
    await Shipment.where({
      "tracking.active": true,
      status: {
        $nin: ["completed", "canceled"]
      }
    }).forEach(async shipment => {
      shipment.updateFlags("tracking-failed");
    });

    // Is late flag
    cronLog.push("update tracking late!");
    await Shipment.where({
      status: "started"
    }).forEach(async shipment => {
      shipment.updateFlags("late");
    });
  }
});
