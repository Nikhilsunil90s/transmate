/* eslint-disable func-names */
import { expect } from "chai";
import {
  addContactUids,
  setStatus,
  sendNextEmail
} from "/imports/api/accountPortal/server/processEmails.js";
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection";
import { accountTestData } from "./accountPortalTestData.js";
import { AccountPortal } from "../AccountPortal";

import { resolvers } from "../apollo/resolvers";

const PORTAL_ID = "4fCKFqX3jZaCWQECt";
const USER_KEY = "213de02a-8da3-41e7-997e-22d4d538a2f7";

const debug = require("debug")("accountPortal:test");

describe("accountPortal", function() {
  let defaultMongo;
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../.testing/mocha/DefaultMongo.js");
      await defaultMongo.connect();
    }

    debug("dynamic import of resetdb");
    await resetDb();
  });
  describe("user", function() {
    beforeEach(async () => {
      await AccountPortal._collection.rawCollection().remove({});
      await AccountPortal._collection
        .rawCollection()
        .insertMany(accountTestData);
    });
    it("add uid on users (no users)", async function() {
      const log = [];
      const result = await addContactUids(log);
      expect(log).to.eql([]);
      expect(result).to.equal("done");
    });
    it("add uid on users (with users)", async function() {
      const log = [];

      // remove userKey on first entry
      await AccountPortal._collection.rawCollection().update(
        { _id: "qEtmgb9NgPTx5mC6o" },
        {
          $unset: {
            "contacts.0.userKey": null
          }
        }
      );
      const result = await addContactUids(log);
      expect(log).to.eql(["update user michel@abouzeid.be"]);
      expect(result).to.equal("done");
    });
    it("set user as confirmed", async function() {
      const result = await setStatus(
        "be039f7d-ef8a-4d4e-b77b-114fdacea051",
        "validated"
      );
      expect(result.result.nModified).to.equal(1);
      expect(result.result.n).to.equal(1);
      expect(result.result.ok).to.equal(1);
    });

    it("sendNextEmail", async function() {
      const log = [];
      const result = await sendNextEmail(log);
      debug("sendNextEmail result %o", result);
      expect(result.email.ok).to.eql(true);

      // force send to test result on local testing
      if (process.env.DEFAULT_MONGO) {
        const email = await result.email.sendClass.buildAndSend();
        expect(email.ok).to.eql(true);
      }
    });

    it("send all mails (10x), check if stops", async function() {
      const log = [];
      let result;
      for (let i = 0; i < 10; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        result = await sendNextEmail(log);
      }
      expect(log[0]).to.contain("send email to ");
      expect(result).to.eql({});
    });
  });
  describe("updates", function() {
    beforeEach(async function() {
      await resetCollections(["accountPortal"]);
    });
    it("[updates][contacts]update existing", async function() {
      const input = {
        id: PORTAL_ID,
        userKey: USER_KEY,
        updates: {
          contacts: [
            {
              mail: "yamri@mytransconsult.be",
              phone: "123456789", // this is new
              name: "Dhr Yahya Amri 2", // updated
              type: "general"
            }
          ]
        }
      };
      const res = await resolvers.Mutation.updatePortalData(null, { input });
      expect(res.contacts[0].phone).to.not.equal(undefined);
    });
    it("[updates][contacts]insert new existing", async function() {
      const input = {
        id: PORTAL_ID,
        userKey: USER_KEY,
        updates: {
          contacts: [
            {
              mail: "yamri@mytransconsult.be",
              phone: "123456789", // this is new
              name: "Dhr Yahya Amri",
              type: "general"
            },
            {
              mail: "test@test.com",
              name: "Test",
              type: "general"
            }
          ]
        }
      };
      const res = await resolvers.Mutation.updatePortalData(null, { input });
      expect(res.contacts).to.have.lengthOf(2);

      const allMails = res.contacts.map(({ mail }) => mail);
      expect(allMails).to.include("test@test.com");
    });
    it("[updates][contacts]removes existing + new", async function() {
      const input = {
        id: PORTAL_ID,
        userKey: USER_KEY,
        updates: {
          contacts: [
            {
              mail: "test@test.com",
              phone: "123456789", // this is new
              name: "Dhr Yahya Amri",
              type: "general"
            }
          ]
        }
      };
      const res = await resolvers.Mutation.updatePortalData(null, { input });
      expect(res.contacts).to.have.lengthOf(2); // the old one should be in!!

      const allMails = res.contacts.map(({ mail }) => mail);
      expect(allMails).to.include("test@test.com");

      const deletedContact = res.contacts.find(
        ({ mail }) => mail === "yamri@mytransconsult.be"
      );
      expect(deletedContact.status).to.equal("doNotContact");
    });
    it("[unSubscribePortalContact]", async function() {
      const args = {
        input: {
          id: PORTAL_ID,
          userKey: USER_KEY,
          email: "yamri@mytransconsult.be"
        }
      };
      const res = await resolvers.Mutation.unSubscribePortalContact(
        null,
        args,
        context
      );
      expect(res).to.not.equal(undefined);
      expect(res).to.be.a("boolean");
      expect(res).to.equal(true);
    });
  });
});
