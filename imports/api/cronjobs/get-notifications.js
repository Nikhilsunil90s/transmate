/* eslint-disable no-await-in-loop */
import { Shipment } from "/imports/api/shipments/Shipment";
import { setShipmentNotificationFlags } from "/imports/api/notifications/helpers/setShipmentNotificationFlags.js";
import { addCron } from "./cron";

const debug = require("debug")("shipment:synced-cron:get-notifications");

export async function getShipmentsWithNotificationsToProcess(log = []) {
  log.push("get shipments");

  // get not-processed notifications, return list of
  // only get notification until yesterday, to avoid old messages to be send
  const now = new Date();
  const yesterday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 1
  );
  const MS_PER_MINUTE = 60000;

  // wait 15 min after last update
  const coolOfTime = new Date(now - 15 * MS_PER_MINUTE);
  debug("find shipments with open notifications.");
  const shipments = await Shipment._collection.rawCollection().find(
    {
      "notifications.sendAt": {
        $gte: yesterday,
        $lte: now
      },
      "updated.at": {
        $lte: coolOfTime
      },

      "notifications.sent": {
        $exists: false
      }
    },
    {
      fields: {
        _id: 1
      }
    }
  );
  log.push(`got shipments`);

  // call notification script for each of the shipments
  // in sequence to spare the db

  const results = [];
  const shipmentIds = [];
  while (await shipments.hasNext()) {
    const { _id: shipmentId } = (await shipments.next()) || {};
    shipmentIds.push(shipmentId);
    if (shipmentId) {
      debug("send notification for ", shipmentId);
      const result = await setShipmentNotificationFlags({
        shipmentId
      }).processNotifications();
      results.push(result);
    }
  }
  log.push(`got shipments`, shipmentIds.join(","));
  return { log, shipmentIds, results };
}

addCron({
  name: "Process shipment notifications",

  // schedule: "30 minutes", // don't use 60 minutes , minutes only <60
  interval: 60 * 30,
  async job(cronLog = []) {
    // async is not working here only meteor fibers!
    try {
      debug("start cron");

      cronLog.push("start");
      await getShipmentsWithNotificationsToProcess(cronLog);
      return { result: "done.." };
    } catch (error) {
      return { error: error.message };
    }
  }
});
