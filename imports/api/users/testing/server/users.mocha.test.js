/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
import { Meteor } from "meteor/meteor";
import { Roles } from "/imports/api/roles/Roles";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection";
import { expect } from "chai";
import { context } from "uniforms";
import { resolvers } from "../../apollo/resolvers";
import { createUserInput } from "./createUserInput";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { User } from "/imports/api/users/User";

const debug = require("debug")("users:test");

const ACCOUNT_ID = "S65957";
const USER_ID = "jsBor6o3uRBTFoRQY";

let defaultMongo;

describe("users", function() {
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      debug("resetdb");
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo");
      await defaultMongo.connect();
    }

    const resetDone = await resetCollections([
      "users",
      "accounts",
      "roleAssingments",
      "roles"
    ]);
    if (!resetDone) throw Error("reset was not possible, test can not run!");
    Meteor.setUserId && Meteor.setUserId(USER_ID);
  });
  describe("resolvers", function() {
    describe("[createUser]", function() {
      it("throws an error when not logged in", async function() {
        let result;
        try {
          result = await resolvers.Mutation.createUser(null, { input: {} }, {});
        } catch (error) {
          result = error;
        }
        expect(result).to.be.an("error");
      });
      it("creates a user with account and roles", async function() {
        const input = createUserInput();
        const userId = await resolvers.Mutation.createUser(
          null,
          { input },
          context
        );
        expect(userId).to.not.equal(undefined);

        const userDoc = await User.profile(userId);
        expect(userDoc).to.not.equal(undefined);
        expect(userDoc.profile.first).to.equal(
          input.user.firstName,
          "firstName"
        );
        expect(userDoc.profile.last).to.equal(input.user.lastName, "lastName");
        expect(userDoc.preferences).to.not.equal(undefined);
        expect(userDoc.preferences.notifications).to.be.an("array");
        expect(userDoc.preferences.notifications[0]).to.be.an("object");

        const [group] = await Roles.getScopesForUser(userId);
        const newAccountId = group.replace("account-", "");
        expect(newAccountId).to.not.equal(undefined);

        const roles = await Roles.getRolesForUser(
          userId,
          `account-${newAccountId}`
        );
        expect(roles).to.include("admin");

        const accountDoc = await AllAccounts.first(newAccountId);
        console.log(accountDoc);
        expect(accountDoc).to.not.equal(undefined);
        expect(accountDoc.name).to.equal(input.account.company);
        expect(accountDoc.userIds[0]).to.equal(userId);

        expect(accountDoc.features).to.be.an("array");
      });
    });
    describe("[updateUserSelf", function() {
      const contexts = {
        accountId: ACCOUNT_ID,
        userId: USER_ID
      };
      it("throws an error when not logged in", async function() {
        let result;
        try {
          result = await resolvers.Mutation.createUser(null, {}, {});
        } catch (error) {
          result = error;
        }
        expect(result).to.be.an("error");
      });
      it("update users profile", async function() {
        const args = {
          updates: {
            profile: {
              first: "Test2",
              last: "Account",
              avatar: ""
            }
          }
        };
        const res = await resolvers.Mutation.updateUserSelf(
          null,
          args,
          contexts
        );
        expect(res).to.not.equal(undefined);
        expect(res.profile.first).to.equal(args.updates.profile.first);
        expect(res.profile.last).to.equal(args.updates.profile.last);
        expect(Boolean(res.profile.avatar)).to.equal(
          Boolean(args.updates.profile.avatar)
        );
      });
    });
    describe("[setApiKeyForUser", function() {
      const contexts = {
        accountId: ACCOUNT_ID,
        userId: USER_ID
      };
      it("throws an error when not logged in", async function() {
        let result;
        try {
          result = await resolvers.Mutation.createUser(null, {}, {});
        } catch (error) {
          result = error;
        }
        expect(result).to.be.an("error");
      });
      it("sets api key for user", async function() {
        const res = await resolvers.Mutation.setApiKeyForUser(
          null,
          null,
          contexts
        );
        expect(res).to.not.equal(undefined);
        expect(res.id).to.equal(contexts.userId);
      });
    });
    describe("update User Preference", function() {
      const contexts = {
        accountId: ACCOUNT_ID,
        userId: USER_ID
      };
      it("[updateUserPreferenceByTopic]", async function() {
        const args = {
          input: {
            topic: "shipmentsView",
            update: "SFmuaoiFLs4FG5mQm"
          }
        };
        const res = await resolvers.Mutation.setApiKeyForUser(
          null,
          args,
          contexts
        );
        expect(res).to.not.equal(undefined);
        expect(res).to.be.an("object");
        expect(res.preferences.views.shipments).to.equal(args.input.update);
      });
    });
    describe("upgrade request", function() {
      const contexts = {
        accountId: ACCOUNT_ID,
        userId: USER_ID
      };
      it("[upgradeRequest]", async function() {
        const args = {
          reference: "shipment"
        };
        const res = await resolvers.Mutation.setApiKeyForUser(
          null,
          args,
          contexts
        );
        expect(res).to.not.equal(undefined);
        expect(res).to.be.an("object");

        // expect(res).to.be.a("boolean");
        // expect(res).to.equal(true);
      });
    });
    describe("[updateUserPreferences", function() {
      const contexts = {
        accountId: ACCOUNT_ID,
        userId: USER_ID
      };
      it("throws an error when not logged in", async function() {
        let result;
        try {
          result = await resolvers.Mutation.createUser(null, {}, {});
        } catch (error) {
          result = error;
        }
        expect(result).to.be.an("error");
      });
      it("updates user preferences", async function() {
        const args = {
          updates: {
            views: {
              shipments: "SFmuaoiFLs4FG5mQmrd"
            }
          }
        };
        const res = await resolvers.Mutation.updateUserPreferences(
          null,
          args,
          contexts
        );
        expect(res).to.not.equal(undefined);
        expect(res.preferences.views.shipments).to.equal(
          args.updates.views.shipments
        );
      });
    });

    // Test for manually set token
  });
});
