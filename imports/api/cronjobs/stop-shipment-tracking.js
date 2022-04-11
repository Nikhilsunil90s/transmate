import { _ } from "meteor/underscore";
import moment from "moment";

import { Shipment } from "/imports/api/shipments/Shipment";
import { NonConformance } from "/import/api/nonConformances/NonConformance";
import { oPath } from "../../utils/functions/path";
import { addCron } from "./cron";

addCron({
  name: "Automatically stop shipment tracking when there has been no signoff",

  // schedule: "1 hour",
  interval: 60 * 60,
  async job(cronLog = []) {
    // This will return the shipment IDs that were modified, if any
    return _.compact(
      await Shipment.where({
        "tracking.active": true,
        status: "started"
        // eslint-disable-next-line consistent-return, array-callback-return
      }).map(shipment => {
        if (oPath(["delivery", "date"], shipment)) {
          // If the planned delivery date was more than a day ago
          if (moment(shipment.delivery.date) < moment().subtract(24, "hours")) {
            cronLog.push(`process shipment ${shipment.id}`);

            // Assume the carrier has failed to sign off upon completion
            shipment.stages().forEach(stage => {
              stage.update({
                status: "completed"
              });
            });
            shipment.update({
              "tracking.active": false
            });

            // shipment.push flags: 'tracking-failed'

            // Add a non-conformance stating that we did not find a sign off event
            NonConformance.create({
              shipmentId: shipment.id,
              comment:
                "Tracking Failure: No shipment arrival flag received from tracking system",
              date: new Date(),
              reasonCode: {
                event: "DO",
                reason: "16",
                owner: "H",
                occurance: "A"
              },
              created: {
                at: new Date()
              }
            });

            return shipment.id;
          }
        }
      })
    );
  }
});
