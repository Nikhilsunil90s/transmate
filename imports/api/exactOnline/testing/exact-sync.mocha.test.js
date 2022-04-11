/* eslint-disable func-names */
import { expect } from "chai";
import { syncExactPartner } from "../exact-sync-partner.js";
import { syncExactCost } from "../exact-sync-cost.js";
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import {
  pendingUserActions,
  checkAndProcessUserActions
} from "../exact-link-user.js";

const debug = require("debug")("exact:sync-partner-test");

let defaultMongo;
describe.skip("_LIVE_exactOnline partner", function() {
  let division;
  this.timeout(10000);
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

    const users = await pendingUserActions();
    expect(users.length).to.equal(1);

    // set accountid on exact user (call api)
    const processing = await checkAndProcessUserActions();

    expect(processing.results).to.be.an("array");

    // debug("checkAndProcessUserActions result %o ", users[0]);
    [
      {
        toProcess: {
          user: { CurrentDivision: division }
        }
      }
    ] = users;
  });

  it("check if we can sync partner", async function() {
    const obj = {
      division,
      carrierId: "S65957",
      name: "GLS transport costs",
      accountId: "C75701"
    };
    debug("sync item with %o", obj);
    const partnerEdiId = await syncExactPartner(obj);
    expect(partnerEdiId).to.be.an("string");
  });

  it("check if we can sync cost with non existent division", async function() {
    debug("sync cost with %o", {
      division
    });
    const result = await syncExactCost({
      division: 1,
      deliveryNumber: 1,
      ediId: "bfd0c14f-d733-442a-a65c-fc9c54760f6c",
      totalCostEur: 100
    });
    expect(result.error).to.include("no token found for");
  });

  it("check if we can confirm cost for existing user", async function() {
    const result = await syncExactCost({
      division: 830287,
      deliveryNumber: 3,
      ediId: "bfd0c14f-d733-442a-a65c-fc9c54760f6c",
      totalCostEur: 100,
      trackingNumber: "123"
    });
    expect(result).to.be.an("object");
  });
});
