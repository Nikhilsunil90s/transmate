/* eslint-disable func-names */
import { expect } from "chai";

import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { templateCheck } from "../check-templates.js";

const debug = require("debug")("email:send:new-user-email");
const defaultMongo = require("../../../../.testing/mocha/DefaultMongo.js");

describe("templates", function() {
  before(async () => {
    debug("create mongo connections");
    await defaultMongo.connect();
    debug("dynamic import of resetdb");
    await resetDb({ resetUsers: true });
  });
  it("check templates", async function() {
    const result = await templateCheck();
    expect(result).to.be.an("array");
    expect(result.some(el => el.error)).to.be.equal(false);
  });

  it.skip("send templates", async function() {
    const result = await templateCheck(true);
    expect(result).to.be.an("array");
    expect(result.some(el => el.error)).to.be.equal(false);
  });
});
