/* eslint-disable no-unreachable */
import { JobManager } from "/imports/utils/server/job-manager.js";
import moment from "moment";
import { getShipmentStakeholders } from "./functions/get-shipment-stakeholders";
import { _ } from "meteor/underscore";
import { EmailBuilder } from "/imports/api/email/server/send-email.js";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { Shipment } from "/imports/api/shipments/Shipment";

JobManager.on("shipment.delayed", "EmailBuilder", notification => {
  return;

  // Disabled for now
  const shipment = Shipment.init(notification.object);
  const lastStage = _.last(shipment.stages());
  const plannedArrival = lastStage.dates.delivery.arrival.planned;
  const requestedArrival = shipment.delivery.date;
  if (plannedArrival > requestedArrival) {
    const carrier = shipment.carrier();
    getShipmentStakeholders(shipment).forEach(accountId => {
      // fix this:
      AllAccounts.getUsers_async(accountId, [
        "core-shipment-update",
        "core-shipment-create"
      ]).map(user => {
        return new EmailBuilder({
          from: `${carrier.name} - ${process.env.EMAIL_SEND_FROM}`, // `${carrier.name} <${carrier.getEmail()}>`,
          to: process.env.EMAIL_DEBUG_TO || user.getEmail(),
          subject: `Shipment ${shipment.number} delayed`,
          content: {
            text: `Shipment ${shipment.number} is delayed by ${
              notification.info.delay
            } minutes.\n \n New ETA: ${moment(plannedArrival).format("LLL")}`
          },
          tag: "shipment"
        }).scheduleMail();
      });
    });
  }
});
