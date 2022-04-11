import { ValidatedMethod } from "meteor/mdg:validated-method";
import SimpleSchema from "simpl-schema";
import { canResetCollections } from "../services/server/loadFixtures/checkServerAndFlag";
import { resetCollections } from "../services/server/loadFixtures/resetCollection";

export const resetDB = new ValidatedMethod({
  name: "testing.resetDB",
  validate: null,
  run() {
    if (canResetCollections()) {
      // call fn
    }
  }
});

export const resetCollectionsMethod = new ValidatedMethod({
  name: "testing.resetCollections",
  validate: new SimpleSchema({
    collections: { type: Array },
    "collections.$": { type: String }
  }).validator(),
  run({ collections = [] }) {
    console.info("resetting collections", collections.join(", "));
    if (canResetCollections()) {
      resetCollections(collections);
    }
  }
});
