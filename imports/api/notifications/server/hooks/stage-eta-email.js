import get from "lodash.get";
import { JobManager } from "/imports/utils/server/job-manager.js";

import moment from "moment";
import { EmailBuilder } from "/imports/api/email/server/send-email.js";
import { getShipmentPlanners } from "./functions/get-shipment-planners";
import { getReferenceNumber } from "/imports/api/shipments/utils";
import { Address } from "/imports/api/addresses/Address";
import { Shipment } from "/imports/api/shipments/Shipment";
import { User } from "/imports/api/users/User";
import { Notification } from "/imports/api/notifications/Notification";

const NOTIFICATION_TRESHOLD = 15; // can also be defined in carrier/user settings in the future
const SHIPMENT_FIELDS = {
  plannerIds: 1,
  accountId: 1,
  number: 1,
  "references.number": 1,
  "delivery.location": 1
};

// output; <place name>, <countryName> <optional UNlocode name>
// eslint-disable-next-line consistent-return
const destinationFormat = shipment => {
  const destination = get(shipment, ["delivery", "location"]);
  if (destination) {
    const { locode } = destination;
    if (locode) {
      return (
        `${destination.name}, ` +
        `${Address.countryName(destination.countryCode)} (${locode.code})`
      );
    }
    const { address } = destination;
    if (address) {
      return `${address.name}, ${address.city}, ${Address.countryName(
        destination.countryCode
      )}`;
    }
    return (
      `${destination.zipCode}, ` +
      `${Address.countryName(destination.countryCode)}`
    );
  }
};

export const stageEtaMailHook = async ({ stage, eta }) => {
  const shipment = await Shipment.first(stage.shipmentId, {
    fields: SHIPMENT_FIELDS
  });

  if (!get(stage, ["dates", "delivery", "arrival", "planned"])) return null;
  const shipmentReferenceNumber = getReferenceNumber(shipment);
  const planned = moment(stage.dates.delivery.arrival.planned);
  const etaM = moment(eta);
  const minutes = etaM.diff(planned, "minutes");
  if (!(minutes > NOTIFICATION_TRESHOLD)) return null;

  const shipmentPlannerIds = await getShipmentPlanners(shipment);
  return Promise.all(
    shipmentPlannerIds.map(async userId => {
      // Mute notifications for 30 minutes after triggering
      const recentlyNotified = await Notification.first({
        created: {
          $gte: moment()
            .subtract(30, "m")
            .toDate()
        },
        userId,
        type: "stage",
        event: minutes > NOTIFICATION_TRESHOLD ? "late" : "eta",
        "data.shipmentId": shipment.id,
        "data.number": shipment.number
      });
      if (recentlyNotified) {
        return;
      }
      const user = await User.profile(userId);
      // eslint-disable-next-line no-new
      new EmailBuilder({
        from: `${process.env.EMAIL_SEND_FROM}`,
        to: process.env.EMAIL_DEBUG_TO || user.getEmail(),
        subject: `Shipment ${shipmentReferenceNumber} delayed`,
        accountId: shipment.accountId,
        templateName: "shipmentEtaUpdateMail",
        tag: "shipment",
        meta: {
          target: process.env.REPORTING_TARGET,
          accountId: shipment.accountId,
          userId: user._id,
          type: "shipment",
          id: shipment._id,
          action: "delayed"
        },
        data: {
          userName: user.getName(),
          shipmentNumber: shipmentReferenceNumber,
          destination: destinationFormat(shipment),
          plannedArrival: planned.format("LLL"),
          delayMinutes: minutes,
          ETA: eta.format("LLL"),
          link: shipment.getTrackUrl()
        }
      }).scheduleMail();
    })
  );
};

// FIXME: triggered by shipment.setEta() -> not triggered anywhere??
JobManager.on("stage.eta", "EmailBuilder", async notification => {
  const stage = notification.object;
  const { eta } = notification.info;
  return stageEtaMailHook({ stage, eta });
});
