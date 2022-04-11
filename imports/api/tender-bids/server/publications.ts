import { Meteor } from "meteor/meteor";
import { TenderBid } from "../TenderBid";
import {
  dbFields
} from "../../../utils/security/checkUserPermissionsForTenderify";


Meteor.publish("tenderbid", async function(tenderBidId: string) {
  if (!this.userId) {
    return this.ready();
  }

  return TenderBid.find(
    { _id: tenderBidId },
    {
      fields: dbFields
    }
  );
});
