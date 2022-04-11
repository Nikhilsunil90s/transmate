/* eslint-disable func-names */
import { expect } from "chai";

import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { sendNewUserEmail } from "../user-created";

const debug = require("debug")("email:send:new-user-email");
const defaultMongo = require("../../../../../../.testing/mocha/DefaultMongo.js");

describe("new user email", function() {
  before(async () => {
    debug("create mongo connections");
    await defaultMongo.connect();
    debug("dynamic import of resetdb");
    await resetDb({ resetUsers: true });
  });
  it("send new user mail", async function() {
    const result = await sendNewUserEmail("jsBor6o3uRBTFoQQQ", "S65957");
    expect(result.ok).to.equal(true);
  });
});
