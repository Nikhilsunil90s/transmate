import { Meteor } from "meteor/meteor";

import { Shipment } from "/imports/api/shipments/Shipment";
import { Stage } from "/imports/api/stages/Stage";
import { Document } from "/imports/api/documents/Document";
import { NonConformance } from "/imports/api/nonConformances/NonConformance";

Meteor.publish("app.trip", function pub(stageId, trip) {
  check(stageId, String);
  // eslint-disable-next-line new-cap
  check(trip, Match.OneOf("pickup", "delivery"));
  if (!this.userId) {
    return this.ready();
  }

  const stages = Stage.find({
    _id: stageId,
    driverId: this.userId
  });
  if (!stages.count()) {
    return this.ready;
  }
  const { shipmentId } = stages.fetch()[0];
  const shipment = Shipment.find(
    {
      _id: shipmentId,
      deleted: false
    },
    {
      fields: {
        references: 1,
        notes: 1,
        dates: 1
      }
    }
  );
  const documents = Document.find({ shipmentId });
  const nonConformances = NonConformance.find({ shipmentId });
  return [shipment, documents, nonConformances];
});
