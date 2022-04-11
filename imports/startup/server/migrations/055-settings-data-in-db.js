/* global Migrations */
import { Settings } from "/imports/api/settings/Settings";
import settingsFixtures from "/imports/api/_jsonSchemas/fixtures/data.settings.json";
import { cleanFixtureData } from "/imports/utils/functions/cleanFixtureData";

Migrations.add({
  version: 55,
  name: "Settings data in db",
  up: async () => {
    const count = await Settings.count();

    if (!count) {
      const cleanedData = cleanFixtureData(
        settingsFixtures
      ).map(({ id, ...data }) => ({ _id: id, ...data }));
      await Settings._collection.rawCollection().insertMany(cleanedData);
    }
    return true;
  }
});
