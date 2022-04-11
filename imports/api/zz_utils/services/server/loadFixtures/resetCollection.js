import {
  getCollectionMap,
  cleanFixtureData,
  modFixtureData,
  generateMoreLines
} from "./fixtureData";
import { canResetCollections } from "./checkServerAndFlag";

const debug = require("debug")("resetCollections");

/** @typedef {import("../../../interfaces/fixtures").MockedCollection} MockedCollection */

export async function resetCollection(
  collection,
  collectionName,
  fixtures,
  mods = [],
  addExtraLines
) {
  if (!canResetCollections()) return true;
  try {
    // if 1 item it might be an object instead of an array
    let data = cleanFixtureData(
      Array.isArray(fixtures) ? fixtures : [fixtures]
    );
    if (addExtraLines) {
      debug("adding %s extra lines for %s", addExtraLines, collectionName);
      data = generateMoreLines(data, addExtraLines);
    }
    if (mods.length) {
      debug("apply mods", mods);
      data = modFixtureData(data, mods);
    }
    if (!collection) {
      throw new Error("collection not found");
    }
    await collection.rawCollection().deleteMany({});
    await collection.rawCollection().insertMany(data);
  } catch (e) {
    console.error("ERROR on", collectionName, e);
  }
  return true;
}

// allows to reset specify collections (array of collection keys)
/** @param {Array<MockedCollection>} collection */
export const resetCollections = (collections = []) => {
  const allCollections = getCollectionMap();
  return Promise.all(
    collections.map(coll => {
      if (!allCollections[coll])
        throw new Error(`${coll} does not have fixtures`);
      const { collection, fixtures, mods, addExtraLines } = allCollections[
        coll
      ];
      debug("reset", coll);
      return resetCollection(collection, coll, fixtures, mods, addExtraLines);
    })
  );
};
