/* eslint-disable no-undef */
import { Location } from "/imports/api/locations/Location";

// const debug = require("debug")("migrations");

Migrations.add({
  version: 29,
  name: "replace index in locations collection to match full UNLOCODE",
  // eslint-disable-next-line consistent-return
  up: () => {
    const newDocs = Location._collection.aggregate(
      [
        {
          $addFields: {
            newId: { $concat: ["$countryCode", "$locationCode"] }
          }
        },
        {
          $group: {
            _id: "$newId",
            oldIds: { $push: "$_id" },
            doc: { $last: "$$ROOT" }
          }
        },
        {
          $project: {
            _id: 1,
            oldIds: 1,
            NameWoDiacritics: "$doc.NameWoDiacritics",
            IATA: "$doc.IATA",
            Coordinates: "$doc.Coordinates",
            countryCode: "$doc.countryCode",
            locationCode: "$doc.locationCode",
            name: "$doc.name",
            subdivision: "$doc.subdivision",
            status: "$doc.status",
            function: "$doc.function",
            remarks: "$doc.remarks",
            fnList: "$doc.fnList",
            movements: "$doc.movements"
          }
        }
      ],
      { allowDiskUse: true }
    );

    try {
      Location._collection.direct.insert(newDocs);

      // remove old ones:
      Location._collection.direct.remove({ oldIds: { $exists: false } });
    } catch (err) {
      console.error(err);
      return "Error updating the locations...";
    }
  }
});
