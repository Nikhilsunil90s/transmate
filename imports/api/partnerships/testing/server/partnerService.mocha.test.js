/* eslint-disable no-unused-expressions */
import { Meteor } from "meteor/meteor";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection";
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { expect } from "chai";

// import { resolvers } from "../../apollo/resolvers";
// import { AccountService } from "../../services/service";
import { PartnerShipService } from "../../services/service";

// import { AllAccounts } from "../../AllAccounts";
// import { User } from "../../../users/User";
// import { RolesAssignment } from "/imports/api/roles/RolesAssignment";
// import {
//   getInviteArguments,
//   generateEntityItem,
//   generateNewUserInput
// } from "./testData";

// const debug = require("debug")("test:allaccounts");

const ACCOUNT_ID = "S65957";
const USER_ID = "jsBor6o3uRBTFoRQY";
const UNLINKED_ACCOUNT_ID = "C11000";

// const LINKED_ACCOUNT_ID = "C75701";

// const OTHER_ACCOUNT_ID = "C11051";
// const OTHER_USER_ID = "pYFLYFDMJEnKADYXX";

let defaultMongo;
describe("parnershipService2", function() {
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo");
      await defaultMongo.connect();
    }

    const resetDone = await resetDb({ resetUsers: true });
    if (!resetDone) throw Error("reset was not possible, test can not run!");
    Meteor.setUserId && Meteor.setUserId(USER_ID);
  });

  describe("resolvers", function() {
    // const context = {
    //   accountId: ACCOUNT_ID,
    //   userId: USER_ID
    // };

    beforeEach(async function() {
      await resetCollections(["accounts", "users", "roleAssingments"]);
      return true;
    });

    // createPartnership(partnerId: String!): AccountTypeD
    it("Try to create duplicate partnership", async function() {
      const srv = new PartnerShipService({
        requestorId: ACCOUNT_ID,
        requestedId: UNLINKED_ACCOUNT_ID
      });
      await srv.init();
      await srv.create();
      expect(srv).to.be.an("object");
      const { requestedBy } = srv.get();
      console.log(requestedBy.partners);

      const srv2 = new PartnerShipService({
        requestorId: ACCOUNT_ID,
        requestedId: UNLINKED_ACCOUNT_ID
      });
      await srv2.init();
      await srv2.create();
      expect(srv2).to.be.an("object");
    });
  });
});
