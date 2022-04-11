/* eslint-disable no-undef */

import { Stage } from "../../../api/stages/Stage";

Migrations.add({
  version: 27,
  name: "add sequence number to stages",
  up: () => {
    // update all for 1:
    Stage._collection.direct.update(
      { sequence: { $exists: false } },
      { $set: { sequence: 1 } },
      { multi: true, bypassCollection2: true }
    );

    // where there is more than 1 stage for a shipment -> separate incremental sequence #
    Stage._collection
      .aggregate([
        {
          $group: {
            _id: "$shipmentId",
            stageIds: { $push: "$_id" },
            count: { $sum: 1 }
          }
        },
        { $match: { count: { $gt: 1 } } }
      ])
      .forEach(stageGrp => {
        const shipmentId = stageGrp._id;
        if (!shipmentId) return; // only valid stages will be updated

        let sequence = 1;
        Stage.find({ shipmentId }).forEach(curStage => {
          Stage._collection.direct.update(
            { _id: curStage._id },
            { $set: { sequence } }
          );
          sequence += 1;
        });
      });
  }
});

/*
in no-sql booster:
const stages = db.stages;
stages.find({sequence: {$exists: false}}).forEach( stage => {
    const {shipmentId} = stage;
    if (!shipmentId) return; // only valid stages will be updated

    const test = stages.findOne({_id: stage._id},{sequence: 1});
    if (test.sequence) return; // was already updated in the mean time...

    let sequence = 1;
    stages.find({shipmentId}).forEach(curStage => {
        stages.update({_id:curStage._id},{$set: {sequence}});
        sequence += 1;
        // debug(curStage._id);
    });
});
*/
