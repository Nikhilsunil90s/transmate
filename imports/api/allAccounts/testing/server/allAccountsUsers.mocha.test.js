/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */
import sinon from "sinon";
import { expect } from "chai";
import { Accounts } from "meteor/accounts-base";
import { userContactService } from "/imports/api/allAccounts/services/accountsUserService";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection";

import { AllAccounts } from "../../AllAccounts";
import { User } from "/imports/api/users/User";
import Roles from "/imports/api/roles/Roles";

const ACCOUNT_ID = "S65957";
const LINKED_ACCOUNT_ID = "C75701";
const EMAIL_NOT_EXISTING_CONTACT = "test-createUserIfNotExists@test.be";

let defaultMongo;
describe("accountUsers", function() {
  let spyFn;
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo");
      await defaultMongo.connect();
    }
  });
  before(function() {
    spyFn = sinon.spy(Accounts, "sendEnrollmentEmail");
  });
  after(function() {
    spyFn.restore();
  });

  describe("service", function() {
    const accountId = ACCOUNT_ID;
    const partnerId = LINKED_ACCOUNT_ID;
    const unlinkedContact = {
      contactType: "general",
      firstName: "Carrier",
      lastName: "Account",
      mail: EMAIL_NOT_EXISTING_CONTACT
    };

    async function addContact(sendInvite = false, contact) {
      const srv = await userContactService({ accountId }).init({ partnerId });
      await srv.createUserIfNotExists({
        contact: contact || unlinkedContact,
        options: { sendInvite }
      });
      await srv.addToContacts();
      const { userId } = srv.get();
      return userId;
    }

    beforeEach(async function() {
      spyFn.resetHistory();
      await resetCollections(["users", "accounts", "roles", "roleAssingments"]);

      // add a contact entry in the profile
      await AllAccounts._collection.update(
        { _id: partnerId, "accounts.accountId": accountId },
        {
          $push: {
            "accounts.$.profile.contacts": unlinkedContact
          }
        }
      );
      return true;
    });
    it("creates user if does not exist - and sends an invite", async function() {
      // partner > has contact (not initialized with userId)
      // code will: create the user > correct roles assignment && linked to partnerAccount!
      // add the userId to the contacts
      const userId = await addContact(true);
      expect(userId).to.be.a("string");

      // invite email triggered:
      expect(spyFn.callCount).to.equal(1);
      expect(spyFn.getCall(0).lastArg).to.eql(userId);

      const user = await User.first(userId);
      expect(user).to.not.equal(undefined);
      expect(user.accountIds).to.include(partnerId);

      // test role assignment:
      const roles = await Roles.getScopesForUser(userId);
      expect(roles).to.have.lengthOf(1);
      expect(roles[0]).to.contain(partnerId);
    });

    it("creates user if does not exist - does NOT sends an invite", async function() {
      // partner > has contact (not initialized with userId)
      // code will: create the user > correct roles assignment && linked to partnerAccount!
      // add the userId to the contacts
      const userId = await addContact(false);
      expect(userId).to.be.a("string");

      // invite email triggered:
      expect(spyFn.callCount).to.equal(0);
    });

    it("we invite the same user again, same userid should be received", async function() {
      const userIdTest1 = await addContact();
      expect(userIdTest1).to.be.a("string");

      const userIdTest2 = await addContact();
      expect(userIdTest2).to.be.a("string");

      expect(userIdTest1).to.equal(userIdTest2);
    });

    it("[throws] when trying to create a user from contact without email", async function() {
      let testError;
      try {
        await addContact(false, { ...unlinkedContact, mail: null });
      } catch (error) {
        testError = error;
      }

      expect(testError).to.be.an("error");
    });
  });
});
