import { Meteor } from "meteor/meteor";

import moment from "moment";

import { Stage } from "/imports/api/stages/Stage";
import { Shipment } from "/imports/api/shipments/Shipment";
import { Item } from "/imports/api/items/Item";
import { ShipmentItem } from "../../items/ShipmentItem";

Meteor.publish("app.trips.stages", function pub() {
  if (!this.userId) {
    return this.ready();
  }
  return Stage.find(
    {
      driverId: this.userId,
      $or: [
        {
          status: {
            $nin: ["draft", "canceled", "completed"]
          }
        },
        {
          // Keep publishing completed shipments for a day, to prevent app errors
          status: "completed",
          "dates.delivery.departure.actual": {
            $gt: moment()
              .startOf("day")
              .toDate()
          }
        }
      ]
    },
    {
      fields: {
        _id: 1,
        shipmentId: 1,
        dates: 1,
        from: 1,
        to: 1
      }
    }
  );
});

Meteor.publish("app.trips.details", function pub(shipmentIds) {
  check(shipmentIds, Array);
  if (!this.userId) {
    return this.ready();
  }
  const shipments = Shipment.find(
    {
      _id: {
        $in: shipmentIds

        // deleted: false
      }
    },
    {
      fields: {
        number: 1,
        status: 1
      }
    }
  );

  // FIXME: remove this -> does this break somehting in the app?
  const items = Item.find(
    {
      shipmentId: {
        $in: shipmentIds
      }
    },
    {
      fields: {
        _id: 1,
        shipmentId: 1,
        volume: 1,
        description: 1
      }
    }
  );

  // :append new items
  const shipmetnItems = ShipmentItem.find(
    {
      shipmentId: {
        $in: shipmentIds

        // level: 0
      }
    },
    {
      fields: {
        _id: 1,
        shipmentId: 1,
        level: 1,
        quantity: 1,
        parentItemId: 1,
        description: 1
      }
    }
  );
  return [shipments, items, shipmetnItems];
});
