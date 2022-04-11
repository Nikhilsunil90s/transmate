/* eslint-disable func-names */
import { expect } from "chai";
import {
  pendingUserActions,
  checkAndProcessUserActions
} from "../exact-link-user";
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { User } from "/imports/api/users/User";

let defaultMongo;
const debug = require("debug")("exact:setup-user-test");

describe("exactOnline users", function() {
  before(async () => {
    debug("create mongo connections");
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../.testing/mocha/DefaultMongo.js");
      await defaultMongo.connect();
    }

    debug("dynamic import of resetdb");
    const resetDone = await resetDb({ resetUsers: true });

    if (!resetDone) throw Error("reset was not possible, test can not run!");
  });

  it("check if user is obj", async function() {
    const log = [];
    const users = await pendingUserActions(log);
    debug("check users to process %o , log :%o", users, log);
    expect(log).to.be.a("array");
    expect(users).to.be.a("array");
    expect(users.length).to.equal(1);
    const user = await User.findOne(users[0].userId);
    expect(user.getEmail()).to.be.a("string");
  });

  it("check users to process", async function() {
    this.timeout(30000);
    const log = [];
    const result = await checkAndProcessUserActions(log);
    debug("check users to process %o , log :%o", result, log);
    expect(log).to.be.a("array");
    expect(result.ok).to.be.equal(true);
  });
});
