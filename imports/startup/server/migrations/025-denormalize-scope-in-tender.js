/* eslint-disable no-undef */
import { Tender } from "/imports/api/tenders/Tender";
import { TenderDetail } from "/imports/api/tenders/TenderDetail";
import { Address } from "/imports/api/addresses/Address";
import { Location } from "/imports/api/locations/Location";
import { oPath } from "/imports/utils/functions/path.js";

// const debug = require("debug")("migrations");

Migrations.add({
  version: 25,
  name: "denormalize scope information in tender details",
  // eslint-disable-next-line consistent-return
  up: () => {
    const bulkTenderOp = Tender._collection
      .rawCollection()
      .initializeOrderedBulkOp();
    bulkTenderOp.executeAsync = Meteor.wrapAsync(bulkTenderOp.execute);

    const bulkTenderDetailOp = TenderDetail._collection
      .rawCollection()
      .initializeOrderedBulkOp();
    bulkTenderDetailOp.executeAsync = Meteor.wrapAsync(
      bulkTenderDetailOp.execute
    );

    Tender._collection
      .find({ deleted: false, "scope.lanes": { $exists: true } })
      .forEach(tenderDoc => {
        // denormalize scope in Master Document:
        const { scope } = tenderDoc;
        const lanes = scope.lanes.map(lane => {
          ["from", "to"].forEach(dir => {
            ["address", "location"].forEach(topic => {
              const ids = oPath([dir, `${topic}Ids`], lane) || [];
              if (ids.length > 0) {
                // addresses are not de-normalized
                if (topic === "address") {
                  lane[dir][topic] = Address._collection
                    .find(
                      { _id: { $in: ids } },
                      { fields: { countryCode: 1, zip: 1, street: 1 } }
                    )
                    .fetch();
                }
                if (topic === "location") {
                  // don't go through Model
                  lane[dir][topic] = Location._collection
                    .find(
                      { _id: { $in: ids } },

                      {
                        fields: {
                          countryCode: 1,
                          locationCode: 1,
                          name: 1
                        }
                      }
                    )
                    .fetch();
                }
              }
            });
          });
          return lane;
        });
        const newScope = { ...scope, lanes };
        bulkTenderOp
          .find({ _id: tenderDoc._id })
          .update({ $set: { scope: newScope } });

        // denormalize details document:
        TenderDetail._collection
          .find({ tenderId: tenderDoc._id })
          .forEach(detail => {
            // final structure of detail:
            // { tenderId, accountId, laneId , volumeGroupId, volumeRangeId, name, goodsDG, equipmentId,
            //  lanes, volumes, equipments }

            // reset all:
            bulkTenderDetailOp.find({ _id: detail._id }).update({
              $unset: { lanes: 1, volumes: 1, equipment: 1, lane: 1 }
            });

            // update:
            const lanesInfo = newScope.lanes.find(
              ({ id }) => id === detail.laneId
            );
            const volumeGroup =
              (newScope.volumes || []).find(
                ({ id }) => id === detail.volumeGroupId
              ) || {};
            const volumeRangeIndex = (volumeGroup.ranges || []).findIndex(
              ({ id }) => id === detail.volumeRangeId
            );
            const volumeRange = volumeRangeIndex >= 0 && {
              ...volumeGroup.ranges[volumeRangeIndex],
              sortIndex: volumeRangeIndex // add sortIndex to the object
            };
            const equipmentsIndex = (newScope.equipments || []).findIndex(
              ({ id }) => id === detail.equipmentId
            );
            const equipments = equipmentsIndex >= 0 && {
              ...newScope.equipments[equipmentsIndex],
              sortIndex: equipmentsIndex
            };

            const update = {
              lanes: lanesInfo,
              ...(volumeRange
                ? { volumes: { ...volumeGroup, ranges: volumeRange } }
                : undefined),
              ...(equipments ? { equipments } : undefined)
            };

            bulkTenderDetailOp
              .find({ _id: detail._id })
              .update({ $set: update });
          });
      });

    try {
      bulkTenderDetailOp.executeAsync();
      bulkTenderOp.executeAsync();

      // debug({ res1, res2 });
    } catch (err) {
      console.error(err);
      return "Error updating price list rates";
    }
    Tender._collection.direct.update(
      {},
      { $set: { updated: { by: "Dsqp3CRYjFpF8rQbh", at: new Date() } } },
      { multi: true }
    );
  }
});
