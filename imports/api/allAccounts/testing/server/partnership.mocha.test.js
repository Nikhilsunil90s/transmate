/* eslint-disable no-unused-expressions */
import { Meteor } from "meteor/meteor";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection";
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { expect } from "chai";

import { resolvers } from "../../apollo/resolvers";
import { AllAccounts } from "../../AllAccounts";

// const debug = require("debug")("test:allaccounts");

const ACCOUNT_ID = "S65957";
const USER_ID = "jsBor6o3uRBTFoRQY";
const UNLINKED_ACCOUNT_ID = "C11000";

// const LINKED_ACCOUNT_ID = "C75701";

// const OTHER_ACCOUNT_ID = "C11051";
// const OTHER_USER_ID = "pYFLYFDMJEnKADYXX";

let defaultMongo;
describe("accountParnership", function() {
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
    const context = {
      accountId: ACCOUNT_ID,
      userId: USER_ID
    };

    beforeEach(async function() {
      await resetCollections(["accounts", "users", "roleAssingments"]);
      return true;
    });

    // createPartnership(partnerId: String!): AccountTypeD
    it("Try to create duplicate partnership", async function() {
      const args = { partnerId: UNLINKED_ACCOUNT_ID };
      const res = await resolvers.Mutation.createPartnership(
        null,
        args,
        context
      );

      expect(res).to.be.an("object");
      expect(res.id).to.equal(UNLINKED_ACCOUNT_ID);

      const partner = await AllAccounts.first(UNLINKED_ACCOUNT_ID, {
        fields: { partners: 1, accounts: 1 }
      });
      expect(partner.partners).to.be.an("array");
      expect(partner.partners[0].accountId).to.equal(context.accountId);
      expect(partner.partners[0].status).to.equal("requested");
      expect(partner.partners[0].requestor).to.equal(false);
      expect(partner.accounts).to.be.an("array");
      expect(partner.accounts[0].accountId).to.equal(context.accountId);

      // update the status:
      // const args2 = { partnerId: partner.id, action: "accept" };
      // const updatedPartnerAccount = await resolvers.Mutation.updatePartnership(
      //   null,
      //   args2,
      //   context
      // );

      // expect(updatedPartnerAccount).to.be.an("object");
      // expect(updatedPartnerAccount.partnership.status).to.equal("active");

      const partner1 = await AllAccounts.first(partner.id);
      expect(partner1.partners[0].status).to.equal("requested");

      // try adding duplicate patnership
      const res2 = await resolvers.Mutation.createPartnership(
        null,
        args,
        context
      );

      expect(res2).to.be.an("object");
      expect(res2.id).to.equal(UNLINKED_ACCOUNT_ID);

      const partnerOld = await AllAccounts.first(UNLINKED_ACCOUNT_ID, {
        fields: { partners: 1, accounts: 1 }
      });
      expect(partnerOld.partners).to.be.an("array");
      expect(partnerOld.partners[0].accountId).to.equal(context.accountId);
      expect(partnerOld.partners[0].status).to.equal("requested");
      expect(partnerOld.partners[0].requestor).to.equal(false);
      expect(partnerOld.accounts).to.be.an("array");

      // expect(partnerOld.accounts[0].accountId).to.equal(context.accountId);
      // expect(res).to.be.an("String");
      // assert.equal(res2, 'DuplicateIgnored');
    });
  });
});
