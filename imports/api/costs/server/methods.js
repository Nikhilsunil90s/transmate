import { ValidatedMethod } from "meteor/mdg:validated-method";
import SimpleSchema from "simpl-schema";
import SecurityChecks from "/imports/utils/security/_security";

import { Cost } from "../Cost";

export const get = new ValidatedMethod({
  name: "costs.get",
  validate: new SimpleSchema(
    {
      options: { type: Object },
      "options.includeDummy": { type: Boolean }
    },
    { requiredByDefault: false }
  ).validator(),
  run({ options = {} }) {
    SecurityChecks.checkLoggedIn(this.userId);

    return Cost.where(
      { ...(!options.includeDummy ? { type: { $ne: "dummy" } } : {}) },
      { sort: { type: 1, group: 1 }, fields: { type: 1, group: 1, cost: 1 } }
    );
  }
});
