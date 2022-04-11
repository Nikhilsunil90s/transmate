import { canResetCollections } from "./checkServerAndFlag";

import { getCollectionMap } from "./fixtureData";
import { resetCollection } from "./resetCollection";
import migrationFixture from "/imports/api/_jsonSchemas/fixtures/data.migrations.json";
import { Shipment } from "/imports/api/shipments/Shipment";

const debug = require("debug")("db:reset:db");

const resetMigrations = async () => {
  const migrations = await Shipment._collection
    .rawDatabase()
    .collection("migrations");
  const { _id, ...migrationDoc } = migrationFixture;
  await migrations.update(
    { _id: "control" },
    { $set: migrationDoc },
    { upsert: true }
  );
};

export const resetDb = async () => {
  debug("Can reset DB? %s", canResetCollections());
  if (!canResetCollections()) return;

  const collectionMap = getCollectionMap();
  debug("reset collections:%o", Object.keys(collectionMap));

  // eslint-disable-next-line consistent-return
  await Promise.all(
    Object.entries(collectionMap)
      .filter(
        ([col]) =>
          col !== "buffer" &&
          !(process.env.FIXTURES_KEEP_USERS && col === "users")
      )
      .map(
        async ([
          col,
          { collection, fixtures = [], mods = [], addExtraLines }
        ]) => {
          debug(
            `resetting ${col} - ${fixtures.length} documents, - ${mods.length} mods `
          );
          return resetCollection(
            collection,
            col,
            fixtures,
            mods,
            addExtraLines
          );
        }
      )
  );

  // manually set the migration to the current migration number
  await resetMigrations();
  // eslint-disable-next-line consistent-return
  return true;
};
