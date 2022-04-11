/* eslint-disable func-names */
/* eslint-disable no-underscore-dangle */
// setup indexes for mongodb
import { Meteor } from "meteor/meteor";

import { Shipment } from "/imports/api/shipments/Shipment";
import { getCollectionMap } from "/imports/api/zz_utils/services/server/loadFixtures/fixtureData";
import { getIndexArray } from "/imports/api/_jsonSchemas/simple-schemas/indexes/index";

const debug = require("debug")("indexes");

async function getCollection(name) {
  if (process.env.DEFAULT_MONGO) {
    // eslint-disable-next-line global-require
    const defaultMongo = require("../../../../.testing/mocha/DefaultMongo");
    const conn = await defaultMongo.connect();
    const db = conn.db();
    return db.collection(name);
  }
  return getCollectionMap()[name].collection.rawCollection();
}

/**
 * should you need indexes outside of this file move the indexes from the setupIndexes function to the indexes object below
 * and use this function to set them up
 *
 *
 * example: await setupIndexesForCollection("addresses"),
 *
 * @param {collectionName} mongo collection name
 */
export async function setupIndexesForCollection(collectionName) {
  const collection = await getCollection(collectionName);
  debug(`recreate index for "${collectionName}"`);
  if (!Array.isArray(getIndexArray()))
    throw Error("indexes should be presented in an array format");
  // eslint-disable-next-line no-use-before-define
  return Promise.all(
    getIndexArray()
      .filter(el => el.collection === collectionName)
      .map(async (index, i) => {
        debug(`setup index %o`, index);
        const result = await collection.createIndex(index.keys, index.options);
        debug(`result ${collectionName} #${i}:`, result);
        return result;
      })
  );
}

export const setupIndexes = async () => {
  // setup capped collection for buffer
  const rawDB = Shipment._collection.rawDatabase();
  debug("recreate buffer capped collection!");
  rawDB.collection("buffer").drop(function(err) {
    if (err) debug("probably capped did no exist, lets create is");

    rawDB.createCollection("buffer", {
      capped: true,
      size: 1073741824, // 512MB 536608768
      max: 50000
    });
    debug("buffer collection deleted and recreated");
  });
  if (!Array.isArray(getIndexArray()))
    throw Error("indexes should be presented in an array format");

  // setup index on log.changes
  // eslint-disable-next-line no-restricted-syntax
  for await (const index of getIndexArray()) {
    debug("setup index %o ", index);
    try {
      await rawDB
        .collection(index.collection)
        .createIndex(index.keys, index.options);
    } catch (e) {
      debug(
        "warning on %o was already set for index %o, error : %o",
        index,
        e.message
      );
    }
  }
};

// FIXME: indexes
if (process.env.REBUILD_INDEXES === "true" || process.env.RESET_DATABASE) {
  console.log("setup mongodb indexes!");
  Meteor.startup(setupIndexes);
}
