/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
import { Meteor } from "meteor/meteor";
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { expect } from "chai";

import { resolvers } from "../../apollo-dataImports/resolvers";

const ACCOUNT_ID = "S65957";
const USER_ID = "jsBor6o3uRBTFoRQY";

let defaultMongo;
describe("data-import", function() {
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo");
      await defaultMongo.connect();
    }

    const resetDone = await resetDb({ resetUsers: true });
    if (!resetDone) throw Error("reset was not possible, test can not run!");
  });
  describe("startDataImport", function() {
    const context = {
      accountId: ACCOUNT_ID,
      userId: USER_ID
    };
    before(async function() {
      Meteor.setUserId && Meteor.setUserId(context.userId);
    });
    it("[startDataImport] start data import", async function() {
      const args = {
        input: {
          type: "address",
          data: [
            {
              street: "Leonardo da Vincilaan",
              number: "7",
              city: "Zaventem",
              zip: "1930",
              state: "Vlaanderen",
              country: "Belgium"
            }
          ],
          references: "GSvTS5mw4rDxfJzuT"
        }
      };
      const res = await resolvers.Mutation.startDataImport(null, args, context);
      expect(res).to.not.equal(undefined);
      expect(res).to.be.a("string");
    });
  });
});
