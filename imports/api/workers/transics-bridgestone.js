/* global Roles */
import { Mongo } from "meteor/mongo";
import { Shipment } from "../shipments/Shipment";
import { oPath } from "../../utils/functions/path";

const moment = require("moment");

// Unfortunately, because Transics doesn't offer us a way to query by shipment,
// we have to continuously keep up to date with the carrier's planning, so that
// when a shipment is imported, we can look up its status and vehicle.
Meteor.startup(() => {
  return {
    wsdl: "https://tx-tango.tx-connect.com/IWS_ASMX/Service.asmx?WSDL",
    args: {
      Login: {
        Dispatcher: "TRANSMATE",
        Password: "TRANSMATE_4294400799",
        SystemNr: 799,
        Integrator: "TRANSMATE",
        Language: "EN"
      }
    }
  };
});

// The actual work of fetching the planning via SOAP is done on the worker
// server
/* temporary disable
  new Job( TrackingJobs, "transics.bridgestone.planning", config )
  	.repeat( schedule: TrackingJobs.later.parse.text "every 5 minutes" )
  	.retry( retries: 50, wait: 10000, backoff: 'exponential' )
  	.save( cancelRepeats: true )
  */
// Set up the collection where we are going to store the values returned by the
// Transics Get_Planning_Modifications API
const TransicsBridgestonePlanning = new Mongo.Collection(
  "tracking.transics.bridgestone.planning"
);

// eslint-disable-next-line no-underscore-dangle
TransicsBridgestonePlanning.createIndex(
  {
    number: 1,
    status: 1,
    position: 1,
    vehicleId: 1,
    activity: 1
  },
  {
    unique: true
  }
);

// Methods and publications for allowing the worker server to communicate with
// our 'cached' planning
Meteor.methods({
  "tracking.transics.bridgestone.planning.next": function planningNext() {
    let timestamp;
    check(this.userId, String);
    if (!Roles.userIsInRole(this.userId, "track")) {
      throw new Meteor.Error(
        403,
        "This user is not allowed to access tracking data."
      );
    }
    const lastCompleted = null;
    timestamp = null;
    if (lastCompleted) {
      lastCompleted.log.forEach(log => {
        if (oPath(["data", "timestamp"], log)) {
          timestamp = moment(log.data.timestamp).add(1, "hours");
        }
      });
    }
    if (!timestamp || timestamp > moment()) {
      // Start of current hour
      timestamp = moment();
    }
    return timestamp.format("YYYY-MM-DDTHH:00:00");
  },
  "tracking.transics.bridgestone.planning.add": function planningAdd({
    number,
    status,
    position,
    vehicleId,
    reference,
    activity,
    created,
    start,
    end
  }) {
    check(number, String);
    check(status, String);
    check(position, Object);
    check(vehicleId, String);
    // eslint-disable-next-line new-cap
    check(reference, Match.Maybe(String));
    check(activity, String);

    // check start, String
    // check end, String
    check(this.userId, String);
    if (!Roles.userIsInRole(this.userId, "track")) {
      throw new Meteor.Error(
        403,
        "This user is not allowed to add tracking data."
      );
    }
    // eslint-disable-next-line no-param-reassign
    created = created || new Date();
    const updated = new Date();
    return TransicsBridgestonePlanning.update(
      { number, status, position, vehicleId, activity },
      {
        $set: {
          number,
          status,
          position,
          vehicleId,
          activity,
          start,
          end,
          updated,
          ...(reference && { reference })
        },
        $setOnInsert: { created }
      },
      {
        upsert: true
      }
    );
  },
  "tracking.transics.bridgestone.planning.get": function planningGet(
    shipmentId
  ) {
    check(shipmentId, String);
    check(this.userId, String);
    if (!Roles.userIsInRole(this.userId, "track")) {
      throw new Meteor.Error(
        403,
        "This user is not allowed to access tracking data."
      );
    }
    const shipment = Shipment.first(shipmentId);
    if (!shipment) {
      throw new Meteor.Error(
        "shipment-not-found",
        `Shipment ${shipmentId} not found (it might have been deleted).`
      );
    }
    const number = oPath(["references", "number"], shipment);
    if (!number) {
      throw new Meteor.Error(
        "no-number",
        `No reference number known for ${shipmentId}.`
      );
    }
    return TransicsBridgestonePlanning.findOne(
      { number },
      {
        sort: {
          updated: -1
        }
      }
    );
  }
});
