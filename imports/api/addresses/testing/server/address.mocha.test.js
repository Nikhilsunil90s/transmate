/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
import { Meteor } from "meteor/meteor";

import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection";
import { expect } from "chai";
import { resolvers } from "../../apollo/resolvers";
import { setupIndexesForCollection } from "/imports/startup/server/meteorStartup/indexes";
import { CheckAddressSecurity } from "/imports/utils/security/checkUserPermissionsForAddress";
import { Address } from "/imports/api/addresses/Address";

const ACCOUNT_ID = "S65957";
const USER_ID = "jsBor6o3uRBTFoRQY";
const UNLINKED_ADDRESS_ID = "EoeX3PEqCyXhiuyXX";
const LINKED_ADDRESS_ID = "j958tYA872PAogTDq";
const LINKED_ACCOUNT_ID = "S65957";

function delay(ms) {
  return new Promise(resolve => {
    setTimeout(() => resolve(true), ms);
  });
}

let defaultMongo;
describe("address", function() {
  // let db;
  // let indexFn = "createIndexes";
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo");
      // eslint-disable-next-line
      const conn = await defaultMongo.connect();
    }

    let resetDone;
    try {
      resetDone = await resetDb({ resetUsers: true });
    } catch (error) {
      console.error("RESET ERR", error);
    }
    if (!resetDone) throw Error("reset was not possible, test can not run!");

    await setupIndexesForCollection("addresses");
    await setupIndexesForCollection("locations");

    await resetCollections(["addresses"]);

    await delay(1000);

    Meteor.setUserId && Meteor.setUserId(USER_ID);
  });
  describe("resolvers", function() {
    const context = {
      accountId: ACCOUNT_ID,
      userId: USER_ID
    };
    beforeEach(function() {
      return resetCollections(["addresses"]);
    });
    it("[getAddressOverview] gets addresses for overview", async function() {
      const res = await resolvers.Query.getAddressOverview(
        null,
        { input: { viewKey: "allLocations" } },
        context
      );
      expect(res).to.be.an("array");
      expect(res).to.have.lengthOf(5);
    });
    it("[getAddressOverview] gets addresses for overview with nameFilter", async function() {
      const res = await resolvers.Query.getAddressOverview(
        null,
        { input: { viewKey: "allLocations", nameFilter: "Mions" } },
        context
      );
      expect(res).to.be.an("array");
      expect(res).to.have.lengthOf(1);
    });
    it("[getAddressWithAnnotation] gets linked Address", async function() {
      const res = await resolvers.Query.getAddress(
        null,
        { addressId: LINKED_ADDRESS_ID },
        context
      );
      expect(res).to.be.an("object");
      expect(res.annotation?.name).to.equal("Globex Belgium");
    });
    it("[search] searches address", async function() {
      const input = { query: "Globex", options: {} };
      const res = await resolvers.Query.searchAddress(null, { input }, context);
      const expected = {
        book: [
          {
            id: "vX2WZcLowBhyP87Mf",
            formatted: "Rodovia Luiz de Queiroz 1, 13467 São Paulo, Brazil",
            isGlobal: false,
            name: "Globex Brazil",
            timeZone: "America/Sao_Paulo"
          },
          {
            id: "EoeX3PEqCyXhiuyCW",
            name: "Globex  Mions",
            formatted: "Rue Paul Emile Victor 24, 69780 Mions, France",
            isGlobal: false,
            timeZone: "Europe/Paris"
          },
          {
            id: "WJNLceXYjFBdYL4YQ",
            name: "Globex Spain",
            formatted: "Avenida de Madrid 43, 28500 Arganda del Rey, Spain",
            isGlobal: false,
            timeZone: "Europe/Madrid"
          },
          {
            id: "j958tYA872PAogTDq",
            name: "Globex Belgium",
            formatted: "Leonardo da Vincilaan 7, 1930 Zaventem, Belgium",
            isGlobal: false,
            timeZone: "Europe/Brussels"
          }
        ],
        global: [],
        locode: []
      };
      expect(expected).to.eql(res);
    });
    it("[search] searches locode", async function() {
      const input = { query: "MYPKG", options: {} };
      const res = await resolvers.Query.searchAddress(null, { input }, context);
      const expected = {
        book: [],
        global: [],
        locode: [
          {
            id: "MYPKG",
            name: "Port Klang (Pelabuhan Klang)",
            timeZone: "Asia/Kuala_Lumpur"
          }
        ]
      };
      expect(expected).to.eql(res);
    });
    it("[link] links an address", async function() {
      // the address has been validated before in the UI (addressId exists!!)
      const NAME = "TEST NAME";
      const args = {
        addressId: UNLINKED_ADDRESS_ID,
        name: NAME,
        updates: {}
      };
      const res = await resolvers.Mutation.linkAddress(null, args, context);
      expect(res.id).to.not.equal(undefined);
      expect(res.annotation?.name).to.equal(NAME);
      expect(res.linkedAccounts?.[0]).to.equal(context.accountId);
    });
    it("[link] links an address for the first time", async function() {
      // the address has been validated before in the UI (addressId exists!!)
      await Address._collection.update(
        { _id: UNLINKED_ADDRESS_ID },
        { $unset: { accounts: 1, linkedAccounts: 1 } }
      );
      const NAME = "TEST NAME";
      const args = {
        addressId: UNLINKED_ADDRESS_ID,
        name: NAME,
        updates: {}
      };
      const res = await resolvers.Mutation.linkAddress(null, args, context);
      expect(res).to.not.equal(undefined);
      expect(res.id).to.not.equal(undefined);
      expect(res.annotation?.name).to.equal(NAME);
      expect(res.linkedAccounts?.[0]).to.equal(context.accountId);
    });
    it("[link] throws when not logged in", async function() {
      const NAME = "TEST NAME";
      const args = {
        addressId: UNLINKED_ADDRESS_ID,
        name: NAME,
        updates: {}
      };
      let testError;
      try {
        await resolvers.Mutation.linkAddress(null, args, {});
      } catch (error) {
        testError = error;
      }
      expect(testError).to.be.an("error");
      expect(testError.message).to.match(/not-authorized/);
    });
    it("[annotate]", async function() {
      const NEW_NAME = "some new name";
      const args = {
        input: { addressId: LINKED_ADDRESS_ID, updates: { name: NEW_NAME } }
      };
      const res = await resolvers.Mutation.annotateAddress(null, args, context);
      expect(res).to.be.an("object");
      expect(res.annotation.name).to.equal(NEW_NAME);
    });
    it("[remove] remove an address", async function() {
      const args = {
        addressId: LINKED_ADDRESS_ID
      };
      const res = await resolvers.Mutation.removeAddress(null, args, context);
      expect(res).to.not.equal(undefined);
      expect(res).to.be.a("Boolean");
      expect(res).to.equal(true);

      // test address:
      const address = await Address.first(
        LINKED_ADDRESS_ID,
        Address.projectFields(ACCOUNT_ID)
      );
      expect(address).to.not.equal(undefined);
      expect(address.accounts).to.equal(undefined); // it is filtered out...
    });
    it("[save address contact", async function() {
      const args = {
        input: {
          addressId: LINKED_ADDRESS_ID,
          partnerId: LINKED_ACCOUNT_ID,
          contacts: [
            {
              contactType: "general",
              firstName: "Paul",
              lastName: "Fowler",
              mail: "paul.fowler@dhl.com"
            }
          ]
        }
      };
      const res = await resolvers.Mutation.saveAddressContacts(
        null,
        args,
        context
      );
      expect(res).to.not.equal(undefined);
      expect(res).to.be.a("Boolean");
      expect(res).to.equal(true);
    });
  });
  describe("security", function() {
    const context = {
      accountId: ACCOUNT_ID,
      userId: USER_ID
    };
    let address = {};
    let addressUnlinked = {};
    before(async function() {
      await resetCollections(["addresses"]);

      address = await Address.first(
        LINKED_ADDRESS_ID,
        Address.projectFields(ACCOUNT_ID)
      );
      addressUnlinked = await Address.first(
        UNLINKED_ADDRESS_ID,
        Address.projectFields(ACCOUNT_ID)
      );
    });

    it("[create] allows creating address if i am planner/admin", async function() {
      const check = new CheckAddressSecurity({}, context);
      await check.getUserRoles();
      const res = check.can({ action: "createAddress" }).check(true);
      expect(res).to.equal(true);
    });
    it("[annotate] allows annotating linked address", async function() {
      const check = new CheckAddressSecurity({ address }, context);
      await check.getUserRoles();
      const res = check.can({ action: "updateAddress" }).check();
      expect(res).to.equal(true);
    });
    it("[annotate] throws annotating address that is not linked", async function() {
      const check = new CheckAddressSecurity(
        { address: addressUnlinked },
        context
      );
      await check.getUserRoles();
      const res = check.can({ action: "updateStage" }).check();
      expect(res).to.equal(false);
    });

    it("[remove] allows removing address", async function() {
      const check = new CheckAddressSecurity({ address }, context);
      await check.getUserRoles();
      check.can({
        action: "removeAddress"
      });

      expect(check.isLinked).to.equal(true);
      expect(check.check()).to.equal(true);
    });
    it("[remove] throws removing address that is not linked", async function() {
      const check = new CheckAddressSecurity(
        { address: addressUnlinked },
        context
      );
      await check.getUserRoles();
      check.can({
        action: "removeAddress"
      });

      expect(check.isLinked).to.equal(false);
      expect(check.check()).to.equal(false);
    });
  });
});

// describe("update", function() {
//   let addressId;
//   beforeEach(function() {
//     const fn = () => {
//       ({ _id: addressId } = Factory.create(
//         "address",
//         GenerateAddressData.dbData(accountId)
//       ));
//     };
//     triggerDDPInvocation({ userId: users.eve.uid }, fn);
//   });
//   it("updates address component of my account (and my account only)", function() {
//     const fn = function() {
//       const args = {
//         addressId,
//         update: { name: "test 123" }
//       };

//       updateAddress.call(args); // does not return anything...
//       const addr = Address.first({ _id: addressId });
//       assert.typeOf(addr, "object");
//       assert.typeOf(addr.accounts, "array");
//       assert.equal(addr.accounts[0].name, "test 123");
//     };
//     triggerDDPInvocation({ userId: users.eve.uid }, fn);
//   });
// });
// describe("security", function() {
// describe("methods", function() {
//   before(function() {
//     updateUserRole(["planner"]);
//   });

// });
// });
