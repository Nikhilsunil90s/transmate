/* global Migrations */
/* eslint-disable no-use-before-define */

import { oPath } from "/imports/utils/functions/path";

import { Location } from "/imports/api/locations/Location";
import { PriceList } from "/imports/api/pricelists/PriceList";

import { Shipment } from "/imports/api/shipments/Shipment";
import { Stage } from "/imports/api/stages/Stage";

import { AnalysisSimulationV2 } from "../../../api/analysis-simulation/AnalysisSimulationV2";

// const debug = require("debug")("migrations");

Migrations.add({
  version: 30,
  name: "replace index in locations collection to match full UNLOCODE",
  // eslint-disable-next-line consistent-return
  up: () => {
    try {
      priceListMigrate();
      shipmentMigrate(); // slow !!!!
      stageMigrate(); // slow !!!! -> use the noSQL code
      analysisSimulationMigrate();
    } catch (err) {
      console.error(err);
      return "Error updating the locations...";
    }
  }
});

const priceListMigrate = () => {
  let counter = 0;
  const bulkOp = PriceList._collection
    .rawCollection()
    .initializeOrderedBulkOp();
  bulkOp.executeAsync = Meteor.wrapAsync(bulkOp.execute);

  const issueList = [];
  PriceList.find({
    $or: [
      { "lanes.from.locationIds": { $exists: true } },
      { "lanes.to.locationIds": { $exists: true } }
    ]
  }).forEach(doc => {
    const { lanes } = doc;

    let touched = false;
    let issue = false;
    const newLanes = lanes.map(lane => {
      ["from", "to"].forEach(dir => {
        // locationIds:
        let locationIds = oPath([dir, "locationIds"], lane) || [];
        locationIds = locationIds.filter(id => id.length > 5); // === oldId structure i.s.o. new ISOCode
        if (locationIds.length > 0) {
          const refs = Location.find({ oldIds: { $in: locationIds } }).map(
            ({ _id }) => _id
          );
          if (refs.length === locationIds.length) {
            lane[dir].locationIds = refs;
            touched = true;
          } else {
            issue = true;
          }
        }
      });

      return lane;
    });
    if (touched && !issue) {
      bulkOp.find({ _id: doc._id }).updateOne({ $set: { lanes: newLanes } });
      counter += 1;
    }

    if (issue) {
      issueList.push(doc._id);
    }
  });
  console.log(issueList);
  if (counter > 0) bulkOp.execute();
};

const shipmentMigrate = () => {
  const bulkOp = Shipment._collection.rawCollection().initializeOrderedBulkOp();
  bulkOp.executeAsync = Meteor.wrapAsync(bulkOp.execute);

  const issueList = [];
  Shipment.find({
    $or: [
      {
        $and: [
          { "pickup.location.locode": { $exists: true } },
          { $expr: { $gt: [{ $strLenCP: "$pickup.location.locode.id" }, 5] } }
        ]
      },
      {
        $and: [
          { "delivery.location.locode": { $exists: true } },
          { $expr: { $gt: [{ $strLenCP: "$delivery.location.locode.id" }, 5] } }
        ]
      }
    ]
  }).forEach(doc => {
    // shipment : [pickup/delivery]:

    let touched = false;
    let issue = false;
    const update = {};
    ["pickup", "delivery"].forEach(dir => {
      // locationIds:
      const locationId = oPath([dir, "location", "locode", "id"], doc);

      if (locationId) {
        const ref = Location._collection.findOne({ oldIds: locationId });
        if (ref && ref.length > 5) {
          update[`${dir}.location.locode.id`] = ref._id;
          touched = true;
        } else {
          issue = true;
        }
      }
    });

    if (touched && !issue) {
      bulkOp.find({ _id: doc._id }).updateOne({ $set: update });
    }

    if (issue) {
      issueList.push(doc._id);
    }
  });
  console.log(issueList);
  bulkOp.execute();
};

const stageMigrate = () => {
  const bulkOp = Stage._collection.rawCollection().initializeOrderedBulkOp();
  bulkOp.executeAsync = Meteor.wrapAsync(bulkOp.execute);

  const issueList = [];
  Stage.find({
    $or: [
      {
        $and: [
          { "from.locode": { $exists: true } },
          { $expr: { $gt: [{ $strLenCP: "$from.locode.id" }, 5] } }
        ]
      },
      {
        $and: [
          { "to.locode": { $exists: true } },
          { $expr: { $gt: [{ $strLenCP: "$to.locode.id" }, 5] } }
        ]
      }
    ]
  }).forEach(doc => {
    // stage : [from/to]:

    let touched = false;
    let issue = false;
    const update = {};
    ["from", "to"].forEach(dir => {
      // locationIds:
      const locationId = oPath([dir, "locode", "id"], doc);

      if (locationId && locationId.length > 5) {
        const ref = Location._collection.findOne({ oldIds: locationId });
        if (ref) {
          update[`${dir}.locode.id`] = ref._id;
          touched = true;
        } else {
          issue = true;
        }
      }
    });

    if (touched && !issue) {
      bulkOp.find({ _id: doc._id }).updateOne({ $set: update });
    }

    if (issue) {
      issueList.push(doc._id);
    }
  });
  console.log(issueList);
  bulkOp.execute();
};

const analysisSimulationMigrate = () => {
  const bulkOp = AnalysisSimulationV2._collection
    .rawCollection()
    .initializeOrderedBulkOp();
  bulkOp.executeAsync = Meteor.wrapAsync(bulkOp.execute);
  let count = 0;
  const issueList = [];
  AnalysisSimulationV2.find({
    $or: [
      { "scope.lanes.from.locationIds": { $exists: true } },
      { "scope.lanes.to.locationIds": { $exists: true } }
    ]
  }).forEach(doc => {
    const {
      scope: { lanes }
    } = doc;

    let touched = false;
    let issue = false;
    const newLanes = lanes.map(lane => {
      ["from", "to"].forEach(dir => {
        // locationIds:
        let locationIds = oPath([dir, "locationIds"], lane) || [];
        locationIds = locationIds.filter(id => id.length > 5); // === oldId structure i.s.o. new ISOCode
        if (locationIds.length > 0) {
          const refs = Location.find({ oldIds: { $in: locationIds } }).map(
            ({ _id }) => _id
          );
          if (refs.length === locationIds.length) {
            lane[dir].locationIds = refs;
            touched = true;
          } else {
            issue = true;
          }
        }
      });

      return lane;
    });
    if (touched && !issue) {
      count += 1;
      bulkOp
        .find({ _id: doc._id })
        .updateOne({ $set: { "scope.lanes": newLanes } });
    }

    if (issue) {
      issueList.push(doc._id);
    }
  });
  console.log(issueList);
  if (count > 0) bulkOp.execute();
};

// ============================
/* code for noSQL booster: 
// PriceList
const oPath = (p, o) =>
    p.reduce((xs, x) => (xs && xs[x] ? xs[x] : null), o);

const Location = db.getCollection("locations");
const PriceList = db.getCollection("price.list");

const bulkOp = PriceList.initializeUnorderedBulkOp();

const issueList = [];
const updateList = [];
const verifiedList = [ 
     ]

// have issues:
    
PriceList.find(
    {$and:[
        // and 1:
        {_id: {$nin: skipList}},
        {_id: {$nin: verifiedList}},
        // and 2:
    { $or: [
    {"lanes.from.locationIds": { $exists: true } },
    {"lanes.to.locationIds": { $exists: true } }
    ]}
    ]}
    // {_id:"vbRw77AadcKcrTRaJ"}
    ).
    forEach( (doc) => {
    const { lanes } = doc

    let touched = false;
    let issue = false;
    const newLanes = lanes.map( (lane) => {
         ["from","to"].forEach( (dir) => {
             // locationIds: 
            let locationIds = oPath([dir, "locationIds"], lane) || [];
            locationIds = locationIds.filter(id => id.length > 5); // === oldId structure i.s.o. new ISOCode 
            if (locationIds.length > 0) {
                const refs = Location.find({ oldIds: { $in: locationIds } }).map(({ _id }) => _id);
                if (refs.length === locationIds.length) {
                    lane[dir].locationIds = refs;
                    touched = true;
                } else {
                    issue = true;
                }
            }     
        });
       
        return lane;
    });
    if (touched && !issue){
        bulkOp.find({_id: doc._id}).updateOne({$set: {lanes: newLanes}})
        updateList.push({doc:doc._id});
    }
    
    if (issue) {
        issueList.push(doc._id);
    }
    
    verifiedList.push(doc._id);
    
    
});


bulkOp.execute();

// ===================================================
// shipment:
const oPath = (p, o) =>
    p.reduce((xs, x) => (xs && xs[x] ? xs[x] : null), o);

const Location = db.getCollection("locations");
const Shipment = db.getCollection("shipments");

const bulkOp = Shipment.initializeUnorderedBulkOp();

const issueList = [];
Shipment.find({
    $or: [
        {            
$and: [
                { "pickup.location.locode": { $exists: true } },
                { "$expr": { "$gt": [{ "$strLenCP": "$pickup.location.locode.id" }, 5] } }
            ]        
},
        {
            $and: [
                { "delivery.location.locode": { $exists: true } },
                { "$expr": { "$gt": [{ "$strLenCP": "$delivery.location.locode.id" }, 5] } }
            ]
        }
    ]
}).forEach(doc => {
    // shipment : [pickup/delivery]:

    let touched = false;
    let issue = false;
    const update = {};
    ["pickup", "delivery"].forEach(dir => {
        // locationIds:
        const locationId = oPath([dir, "location", "locode", "id"], doc);

        if (locationId && locationId.length > 5) {
            const ref = Location
                .findOne({ oldIds: locationId })
                ;
            if (ref) {
                update[`${dir}.location.locode.id`] = ref._id;
                touched = true;
            } else {
                issue = true;
            }
        }
    });

    if (touched && !issue) {
        bulkOp.find({ _id: doc._id }).updateOne({ $set: update });
    }

    if (issue) {
        issueList.push(doc._id);
    }

});
console.log(issueList);
bulkOp.execute();


// ============================================
// stages:

const oPath = (p, o) =>
    p.reduce((xs, x) => (xs && xs[x] ? xs[x] : null), o);

const Location = db.getCollection("locations");
const Stage = db.getCollection("stages");

const bulkOp = Stage.initializeUnorderedBulkOp();

const issueList = [];
Stage.find({
    $or: [
      {
        $and: [
          { "from.locode": { $exists: true } },
          { $expr: { $gt: [{ $strLenCP: "$from.locode.id" }, 5] } }
        ]
      },
      {
        $and: [
          { "to.locode": { $exists: true } },
          { $expr: { $gt: [{ $strLenCP: "$to.locode.id" }, 5] } }
        ]
      }
    ]
  }).forEach(doc => {
    // stage : [from/to]:

    let touched = false;
    let issue = false;
    const update = {};
    ["from", "to"].forEach(dir => {
      // locationIds:
      const locationId = oPath([dir, "locode", "id"], doc);

      if (locationId && locationId.length > 5) {
        const ref = Location.findOne({ oldIds: locationId });
        if (ref) {
          update[`${dir}.locode.id`] = ref._id;
          touched = true;
        } else {
          issue = true;
        }
      }
    });

    if (touched && !issue) {
      bulkOp.find({ _id: doc._id }).updateOne({ $set: update });
    }

    if (issue) {
      issueList.push(doc._id);
    }
  });
  console.log(issueList);
  bulkOp.execute();


//============================
// simulation:
const oPath = (p, o) =>
    p.reduce((xs, x) => (xs && xs[x] ? xs[x] : null), o);

const Location = db.getCollection("locations");
const AnalysisSimulationV2 = db.getCollection("analysis.simulationV2");

const bulkOp = AnalysisSimulationV2.initializeUnorderedBulkOp();

const issueList = [];
AnalysisSimulationV2.find({
    $or: [
        { "scope.lanes.from.locationIds": { $exists: true } },
        { "scope.lanes.to.locationIds": { $exists: true } }
    ]
}).forEach(doc => {
    const {
        scope: { lanes }
    } = doc;

    let touched = false;
    let issue = false;
    const newLanes = lanes.map(lane => {
        ["from", "to"].forEach(dir => {
            // locationIds:
            let locationIds = oPath([dir, "locationIds"], lane) || [];
            locationIds = locationIds.filter(id => id.length > 5); // === oldId structure i.s.o. new ISOCode
            if (locationIds.length > 0) {
                const refs = Location.find({ oldIds: { $in: locationIds } }).map(
                    ({ _id }) => _id
                );
                if (refs.length === locationIds.length) {
                    lane[dir].locationIds = refs;
                    touched = true;
                } else {
                    issue = true;
                }
            }
        });

        return lane;
    });
    if (touched && !issue) {
        bulkOp
            .find({ _id: doc._id })
            .updateOne({ $set: { "scope.lanes": newLanes } });
    }

    if (issue) {
        issueList.push(doc._id);
    }
});
console.log(issueList);
bulkOp.execute();


*/
