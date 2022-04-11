/* eslint-disable no-underscore-dangle */
import { ValidatedMethod } from "meteor/mdg:validated-method";
import SimpleSchema from "simpl-schema";
import SecurityChecks from "/imports/utils/security/_security";

// collections
import { TenderBidMapping } from "./TenderBidMapping";

export const insertRowTenderBidMapping = new ValidatedMethod({
  name: "tenderify.insertRowMapping",
  description: "method called when updating a mapping",
  validate: new SimpleSchema({
    mappingId: Object,
    "mappingId._str": String,
    topic: String,
    index: Number,
    rowData: { type: Object, blackbox: true }
  }).validator(),
  run({ mappingId, topic, index, rowData }) {
    SecurityChecks.checkLoggedIn(this.userId);

    const tenderBidMap = TenderBidMapping.first({ _id: mappingId });
    SecurityChecks.checkIfExists(tenderBidMap);

    // insert into array (at the right position):
    TenderBidMapping._collection.update(
      { _id: mappingId },
      {
        $push: {
          [`mappingV.${topic}.data`]: {
            $each: [{ ...rowData, updated: true }],
            $position: index
          }
        }
      }
    );
  }
});
