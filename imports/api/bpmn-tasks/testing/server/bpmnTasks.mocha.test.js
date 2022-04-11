/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection";
import { resolvers } from "../../apollo/resolvers";
import { expect } from "chai";

const ACCOUNT_ID = "S65957";
const USER_ID = "jsBor6o3uRBTFoRQY";
const TASK_ID = "manualTask";

let defaultMongo;
describe("updateTask", function() {
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo");
      await defaultMongo.connect();
    }

    const resetDone = await resetDb({ resetUsers: true });
    if (!resetDone) throw Error("reset was not possible, test can not run!");
  });
  describe("updateTask", function() {
    beforeEach(function() {
      return resetCollections(["users", "accounts"]);
    });
    const context = {
      accountId: ACCOUNT_ID,
      userId: USER_ID
    };
    it.skip("[updateTask]", async function() {
      const args = {
        input: {
          taskId: TASK_ID,
          update: {
            dueDate: {
              date: "2020-12-22T22:03:08.318+02:00"
            }
          },
          option: {}
        }
      };
      const res = await resolvers.Mutation.updateTask(null, args, context);
      expect(res).to.not.equal(undefined);
      expect(res).to.be.a("Boolean");
      expect(res).to.equal(true);
    });
  });
});
