/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
import { Meteor } from "meteor/meteor";
import faker from "faker";
import { Random } from "/imports/utils/functions/random.js";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection";
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { expect } from "chai";

import { resolvers } from "../../apollo/resolvers";
import { AccountService } from "../../services/service";
import { AllAccounts } from "../../AllAccounts";
import { User } from "../../../users/User";
import { RolesAssignment } from "/imports/api/roles/RolesAssignment";
import {
  getInviteArguments,
  generateEntityItem,
  generateNewUserInput
} from "./testData";

import { CheckPartnershipSecurity } from "../../../../utils/security/checkUserPermissionsForPartnerShip";
import { CheckAccountSecurity } from "../../../../utils/security/checkUserPermissionsForAccount";

const debug = require("debug")("test:allaccounts");

const ACCOUNT_ID = "S65957";
const USER_ID = "jsBor6o3uRBTFoRQY";
const UNLINKED_ACCOUNT_ID = "C11000";
const LINKED_ACCOUNT_ID = "C75701";

const OTHER_ACCOUNT_ID = "C11051";
const OTHER_USER_ID = "pYFLYFDMJEnKADYXX";

let defaultMongo;
describe("account", function() {
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

  describe("services", function() {
    beforeEach(function() {
      resetCollections(["accounts"]);
    });
    it("generates a correct accountId", function() {
      const shipperId = AccountService.generateId({ type: "shipper" });
      const carrierId = AccountService.generateId({ type: "carrier" });
      const providerId = AccountService.generateId({ type: "provider" });
      expect(shipperId.substr(0, 1)).to.equal(
        "S",
        "Shipper Id should start with a S"
      );
      expect(carrierId.substr(0, 1)).to.equal(
        "C",
        "CarrierId should start with a C"
      );
      expect(providerId.substr(0, 1)).to.equal(
        "P",
        "ProviderId should start with a P"
      );
    });
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
    it("[createPartnership] creates partnership", async function() {
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
    });

    //   inviteAccount(input: AccountInviteInput!): AccountTypeD
    it("[inviteAccount] invites partner", async function() {
      const TYPE = "carrier";
      const input = getInviteArguments({ type: TYPE });

      const args = { input };
      const createdPartner = await resolvers.Mutation.inviteAccount(
        null,
        args,
        context
      );

      expect(createdPartner).to.not.equal(undefined);
      expect(createdPartner.type).to.equal(TYPE);
      expect(createdPartner.id).to.not.equal(undefined);
      expect(createdPartner.name).to.equal(args.input.company);

      const partnerDoc = await AllAccounts.first(createdPartner.id);
      expect(partnerDoc.partners).to.be.an("array", "partner []");
      expect(partnerDoc.partners[0].accountId).to.equal(context.accountId);
      expect(partnerDoc.partners[0].status).to.equal("requested");
      expect(partnerDoc.partners[0].requestor).to.equal(false);

      expect(partnerDoc.accounts).to.be.an("array", "accounts []");
      expect(partnerDoc.accounts[0].accountId).to.equal(context.accountId);
      expect(partnerDoc.accounts[0].name).to.equal(args.input.company);
      expect(partnerDoc.accounts[0].coding).to.not.equal(undefined);
      expect(partnerDoc.accounts[0].profile).to.not.equal(undefined);
      expect(partnerDoc.accounts[0].profile.contacts).to.be.an(
        "array",
        "contacts []"
      );
      expect(partnerDoc.accounts[0].profile.contacts[0].mail).to.equal(
        args.input.email
      );
      expect(partnerDoc.accounts[0].profile.contacts[0].linked).to.not.equal(
        null
      );

      expect(partnerDoc.userIds).to.be.an("array", "userIds []");
      expect(partnerDoc.userIds[0]).to.be.a("string", "userId in partnerDoc");

      // check user document:
      const createdUserId = partnerDoc.userIds[0];
      const createdUser = await User.first(createdUserId, {
        fields: { accountIds: 1 }
      });

      expect(createdUser).to.not.equal(undefined);
      expect(createdUser.accountIds).to.be.an("array", "user > accountIds []");
      expect(createdUser.accountIds).to.have.lengthOf(1);

      expect(createdUser.accountIds[0]).to.equal(createdPartner.id);
    });

    // updatePartnership(partnerId: String!, action: PARTNERSHIP_ACTION!): String
    it("[updatePartnership][accept] updates partnership", async function() {
      // have a clean link:
      const args = { partnerId: UNLINKED_ACCOUNT_ID };
      const linkedAccount = await resolvers.Mutation.createPartnership(
        null,
        args,
        context
      );

      // update the status:
      const args2 = { partnerId: linkedAccount.id, action: "accept" };
      const updatedPartnerAccount = await resolvers.Mutation.updatePartnership(
        null,
        args2,
        context
      );

      expect(updatedPartnerAccount).to.be.an("object");
      expect(updatedPartnerAccount.partnership.status).to.equal("active");

      const partner = await AllAccounts.first(linkedAccount.id);
      expect(partner.partners[0].status).to.equal("active");
    });
    it("[updatePartnership][reject] updates partnership", async function() {
      // have a clean link:
      const args = { partnerId: UNLINKED_ACCOUNT_ID };
      const linkedAccount = await resolvers.Mutation.createPartnership(
        null,
        args,
        context
      );

      // update the status:
      const args2 = { partnerId: linkedAccount.id, action: "reject" };
      const updatedPartnerAccount = await resolvers.Mutation.updatePartnership(
        null,
        args2,
        context
      );

      expect(updatedPartnerAccount).to.be.an("object");
      expect(updatedPartnerAccount.partnership.status).to.equal("rejected");

      const partner = await AllAccounts.first(linkedAccount.id);
      expect(partner.partners[0].status).to.equal("rejected");
    });
    it("[updatePartnership][deactivate] updates partnership", async function() {
      // have a clean link:
      const args = { partnerId: UNLINKED_ACCOUNT_ID };
      const linkedAccount = await resolvers.Mutation.createPartnership(
        null,
        args,
        context
      );

      // update the status:
      const args2 = { partnerId: linkedAccount.id, action: "deactivate" };
      const updatedPartnerAccount = await resolvers.Mutation.updatePartnership(
        null,
        args2,
        context
      );

      expect(updatedPartnerAccount).to.be.an("object");
      expect(updatedPartnerAccount.partnership.status).to.equal("inactive");

      const partner = await AllAccounts.first(linkedAccount.id);
      expect(partner.partners[0].status).to.equal("inactive");
    });
    it("[findUserByEmail_async] find a user", async function() {
      const email = "demo@transmate.eu";
      const user = await AllAccounts.findUserByEmail_async(email);
      debug("user %o", user);
      expect(user.email).to.equal(email);
      expect(user._id).to.be.an("string");
    });

    it("[findUserByEmail_async] find a user UpperCase", async function() {
      const email = "demo@transmate.eu";
      const user = await AllAccounts.findUserByEmail_async(email.toUpperCase());
      debug("user %o", user);
      expect(user.email).to.equal(email);
      expect(user._id).to.be.an("string");
    });

    // updateAccountSettings(updates: AccountSettingsUpdates!): AccountSettings
    it("[updateAccountSettings] updates settings", async function() {
      const args = {
        updates: {
          roles: ["some-custom-role"],
          charges: ["newCharge"],
          projectCodes: [
            {
              code: "TestCode",
              group: "TestGroup",
              name: "TestName"
            }
          ],
          projectYears: [2021, 2022],
          emails: {
            template_id: "d-9046e6995c114255803506e857344137"
          },
          itemUnits: [
            {
              type: "TU",
              name: "TAUTLINER",
              code: "TAUTLINER",
              unitType: "truck",
              taxKeys: {}
            }
          ],
          tags: ["someNewTag"]

          // costs: [{}]
        }
      };
      const res = await resolvers.Mutation.updateAccountSettings(
        null,
        args,
        context
      );

      expect(res).to.be.an("object");
      expect(res).to.not.equal(undefined);
      expect(res.projectCodes).to.be.an("array");

      expect(res.charges).to.be.an("array");
      expect(res.charges[0]).to.equal(args.updates.charges[0]);
      expect(res.roles).to.be.an("array");
      expect(res.roles[0]).to.equal(args.updates.roles[0]);
      expect(res.tags).to.be.an("array");
      expect(res.tags[0]).to.equal(args.updates.tags[0]);
      expect(res.projectYears).to.be.an("array");
      expect(res.projectYears).to.eql(args.updates.projectYears);
      expect(res.itemUnits).to.be.an("array");
      expect(res.itemUnits).to.eql(args.updates.itemUnits);
      expect(res.emails).to.be.an("object");
      expect(res.emails).to.eql(args.updates.emails);
    });

    // annotatePartner(input: AccountAnnotateInput!): AccountTypeD
    it("[annotatePartner][coding] annotates partner", async function() {
      const UPDATE = {
        vendorId: "Some id",
        ediId: "EDI EXAMPLE",
        color: "#FFFFFF",
        code: "CODE 123"
      };
      const args = {
        input: {
          partnerId: LINKED_ACCOUNT_ID,
          update: UPDATE,
          root: "coding"
        }
      };
      const updatedPartner = await resolvers.Mutation.annotatePartner(
        null,
        args,
        context
      );

      expect(updatedPartner).to.be.an("object");
      expect(updatedPartner.annotation).to.be.an("object"); // is projected
      expect(updatedPartner.annotation.coding).to.be.an("object");
      expect(updatedPartner.annotation.coding.ediId).to.equal(UPDATE.ediId);
      expect(updatedPartner.annotation.coding.vendorId).to.equal(
        UPDATE.vendorId
      );
      expect(updatedPartner.annotation.coding.color).to.equal(UPDATE.color);
      expect(updatedPartner.annotation.coding.code).to.equal(UPDATE.code);
    });
    it("[annotatePartner][notes] annotates partner", async function() {
      const UPDATE = {
        // text is slate
        text: JSON.stringify([
          { children: [{ text: faker.lorem.paragraph() }] }
        ]),
        date: new Date()
      };
      const args = {
        input: {
          partnerId: LINKED_ACCOUNT_ID,
          update: UPDATE,
          root: "notes"
        }
      };
      const updatedPartner = await resolvers.Mutation.annotatePartner(
        null,
        args,
        context
      );

      expect(updatedPartner).to.be.an("object");
      expect(updatedPartner.annotation).to.be.an("object"); // is projected
      expect(updatedPartner.annotation.notes).to.be.an("object");
      expect(updatedPartner.annotation.notes.text).to.not.equal(undefined);
      expect(updatedPartner.annotation.notes.date).to.be.an.instanceof(Date);
    });
    it("[annotatePartner][profile] annotates partner", async function() {
      const UPDATE = {
        contacts: [
          {
            contactType: "general",
            linkedId: "NTZsWDYw2LMJF8ycT",
            firstName: "Paul",
            lastName: "Fowler",
            mail: "paul.fowler@dhl.com"
          },
          {
            contactType: "general",
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            mail: faker.internet.email()
          }
        ]
      };
      const args = {
        input: {
          partnerId: LINKED_ACCOUNT_ID,
          update: UPDATE,
          root: "profile"
        }
      };
      const updatedPartner = await resolvers.Mutation.annotatePartner(
        null,
        args,
        context
      );

      expect(updatedPartner).to.be.an("object");
      expect(updatedPartner.annotation).to.be.an("object"); // is projected
      expect(updatedPartner.annotation.profile).to.be.an("object");
      expect(updatedPartner.annotation.profile.contacts).to.be.an("array");
      expect(updatedPartner.annotation.profile.contacts).to.have.lengthOf(2);
      expect(updatedPartner.annotation.profile.contacts[1]).to.eql(
        UPDATE.contacts[1]
      );
    });

    // updateAccount(updates: AccountUpdateInput!): AccountTypeD
    it("[updateAccount] updates own account", async function() {
      const args = {
        updates: {
          entities: [
            generateEntityItem(),
            generateEntityItem(),
            generateEntityItem()
          ]
        }
      };
      const updatedAccount = await resolvers.Mutation.updateAccount(
        null,
        args,
        context
      );

      expect(updatedAccount).to.be.an("object");
      expect(updatedAccount).to.not.equal(undefined);
      expect(updatedAccount.entities).to.be.an("array");
      expect(updatedAccount.entities).to.have.lengthOf(
        args.updates.entities.length
      );
      expect(updatedAccount.entities).to.eql(args.updates.entities);
    });

    // addUserToAccount(input: NewUserInput!): AccountTypeD
    it("[addUserToAccount] adds user", async function() {
      const args = {
        input: {
          user: generateNewUserInput(),
          options: {
            sendMail: false
          }
        }
      };
      const updatedAccount = await resolvers.Mutation.addUserToAccount(
        null,
        args,
        context
      );

      expect(updatedAccount).to.be.an("object");
      expect(updatedAccount).to.not.equal(undefined);
      expect(updatedAccount.users).to.be.an("array");
      expect(updatedAccount.users).to.have.lengthOf(2); // if in -> userIds [] should be ok as well

      expect(updatedAccount.users[1].emails[0]?.address).to.equal(
        args.input.user.email,
        "emails stored"
      );

      const newUserId = updatedAccount.userIds[1];
      expect(newUserId).to.be.a("string");

      // check roles of created user:
      let roleAssignment = await RolesAssignment.find({
        "user._id": newUserId
      });
      roleAssignment = await roleAssignment.fetch();
      expect(roleAssignment).to.not.equal(undefined);
      expect(roleAssignment).to.be.an("array");
      expect(roleAssignment[0]?.role?._id).to.equal(
        "user",
        "allocation doc should exist"
      );

      // test userDocument:
      const createdUser = await User.first(newUserId, {
        fields: { accountIds: 1, profile: 1 }
      });

      expect(createdUser).to.not.equal(undefined);
      expect(createdUser.accountIds).to.be.an("array");
      expect(createdUser.accountIds).to.have.lengthOf(1);

      expect(createdUser.accountIds[0]).to.equal(context.accountId);

      expect(createdUser.profile.first).to.equal(args.input.user.first);
      expect(createdUser.profile.last).to.equal(args.input.user.last);
    });

    // removeUserFromAccount(userId: String!): AccountTypeD
    it("[removeUserFromAccount] removes user", async function() {
      // add an example:
      const args = {
        input: {
          user: generateNewUserInput(),
          options: {
            sendMail: false
          }
        }
      };
      const updatedAccount = await resolvers.Mutation.addUserToAccount(
        null,
        args,
        context
      );
      const newUserId = updatedAccount.userIds[1];

      // the test:
      const args2 = {
        userId: newUserId
      };
      const updatedAccount2 = await resolvers.Mutation.removeUserFromAccount(
        null,
        args2,
        context
      );

      expect(updatedAccount2).to.be.an("object");
      expect(updatedAccount2).to.not.equal(undefined);
      expect(updatedAccount2.users).to.be.an("array");
      expect(updatedAccount2.users).to.have.lengthOf(1);

      // check roles of created user:
      let roleAssignment = await RolesAssignment.find({
        "user._id": newUserId
      });
      roleAssignment = await roleAssignment.fetch();

      expect(roleAssignment).to.not.equal(undefined);
      expect(roleAssignment).to.be.an("array");
      expect(roleAssignment).to.have.lengthOf(0); // none found

      // check user doc:
      const user = await User.first(newUserId);
      expect(user.deleted).to.equal(true);

      // FIXME: should pull first, then delete??
    });

    // updateUserRole(input: UserRoleUpdateInput!): User # updated doc with role
    it("[updateUserRole] updates user role", async function() {
      // add a user:
      const args = {
        input: {
          user: generateNewUserInput(),
          options: {
            sendMail: false
          }
        }
      };
      const updatedAccount = await resolvers.Mutation.addUserToAccount(
        null,
        args,
        context
      );
      const newUserId = updatedAccount.userIds[1];

      // the test: - adding as admin
      const args2 = {
        input: {
          userId: newUserId,
          role: "admin",
          remove: false
        }
      };
      const updatedUser = await resolvers.Mutation.updateUserRole(
        null,
        args2,
        context
      );

      expect(updatedUser).to.be.an("object");
      expect(updatedUser.baseRoles).to.be.an("array");
      expect(updatedUser.baseRoles).to.include("admin");

      // test to remove a role:
      const args3 = {
        input: {
          userId: newUserId,
          role: "admin",
          remove: true
        }
      };
      const updatedUser2 = await resolvers.Mutation.updateUserRole(
        null,
        args3,
        context
      );

      expect(updatedUser2).to.be.an("object");
      expect(updatedUser2.baseRoles).to.be.an("array");
      expect(updatedUser2.baseRoles).to.not.include("admin");
    });

    // updateUserEntities(input: UserEntityUpdateInput!): User # updated doc with entitity
    it("[updateUserEntities] updates user entity allocation", async function() {
      const ENTITY_CODE = "ENTITY_CODE";
      //#region add a new user:
      const args = {
        input: {
          user: generateNewUserInput(),
          options: {
            sendMail: false
          }
        }
      };
      const updatedAccount = await resolvers.Mutation.addUserToAccount(
        null,
        args,
        context
      );
      const newUserId = updatedAccount.userIds[1];
      //#endregion

      // the test: - add to entity
      const args2 = {
        input: {
          userId: newUserId,
          entity: ENTITY_CODE,
          remove: false
        }
      };
      const updatedUser = await resolvers.Mutation.updateUserEntities(
        null,
        args2,
        context
      );

      expect(updatedUser).to.be.an("object");
      expect(updatedUser.entities).to.be.an("array");
      expect(updatedUser.entities).to.include(ENTITY_CODE);

      // test to remove a entity:
      const args3 = {
        input: {
          userId: newUserId,
          entity: ENTITY_CODE,
          remove: true
        }
      };
      const updatedUser2 = await resolvers.Mutation.updateUserEntities(
        null,
        args3,
        context
      );

      expect(updatedUser2).to.be.an("object");
      expect(updatedUser2.entities).to.be.an("array");
      expect(updatedUser2.entities).to.not.include(ENTITY_CODE);
    });
    it("[removeAccountSettingsCost] remove settings cost", async function() {
      const args = {
        id: ACCOUNT_ID
      };
      const res = await resolvers.Mutation.removeAccountSettingsCost(
        null,
        args,
        context
      );
      expect(res).to.not.equal(undefined);
      expect(res).to.be.a("boolean");
      expect(res).to.equal(true);
    });
    it.skip("[addToFavorites] add account to favorite list", async function() {
      const args = {
        input: {
          partnerId: OTHER_USER_ID,
          add: true
        }
      };
      const res = await resolvers.Mutation.addToFavorites(null, args, context);
      expect(res).to.not.equal(undefined);
      expect(res).to.be.an("object");
      expect(res.isFavorite).to.equal(true);
      expect(res.id).to.equal(args.input.partnerId);
    });
    it.skip("[createUserByContact] create users", async function() {
      const args = {
        input: {
          partnerId: LINKED_ACCOUNT_ID,
          contact: {
            contactType: "general",
            linkedId: "NTZsWDYw2LMJF8ycT",
            firstName: "Paul",
            lastName: "Fowler",
            mail: "paul.fowler@dhl.com"
          }
        }
      };
      const res = await resolvers.Mutation.createUserByContact(
        null,
        args,
        context
      );
      expect(res).to.not.equal(undefined);
      expect(res).to.be.an("object");
      expect(res).to.have("userId");
    });

    // TODO [#388]: write tests for:
    // removeAccountSettingsCost(id: String!): Boolean
    // upsertAccountSettingsCost(input: UpdateAccountCostSettingInput!): String
    // addToFavorites(input: addToFavoritesInput!): AccountTypeD
  });
  describe.skip("Query", function() {});
  describe("security partners", function() {
    let partner;
    const partnerId = LINKED_ACCOUNT_ID;
    const context = {
      accountId: ACCOUNT_ID,
      userId: USER_ID
    };
    before(async function() {
      partner = await AllAccounts.first(partnerId);
    });
    it("[canCreatePartnerShip] allows/denies", async function() {
      const partnerCheck1 = { ...partner, partners: [] };
      const check = new CheckPartnershipSecurity(
        {
          partner: partnerCheck1
        },
        context
      );
      await check.getUserRoles();
      check.can({ action: "canCreatePartnerShip" });
      expect(check.check()).to.equal(
        true,
        "should be able to create if I am planner, no partnership exists"
      );

      const partnerCheck2 = {
        ...partner,
        partners: [{ accountId: context.accountId, status: "requested" }]
      };
      const check2 = new CheckPartnershipSecurity(
        {
          partner: partnerCheck2
        },
        context
      );
      await check2.getUserRoles();
      check2.can({ action: "canCreatePartnerShip" });

      expect(check2.check()).to.equal(
        false,
        "should not be able to create if I am planner, a partnership exists"
      );
    });
    it("[canBeDeactivated] allows/denies", async function() {
      const partnerCheck = {
        ...partner,
        partners: [{ accountId: context.accountId, status: "requested" }]
      };
      const check = new CheckPartnershipSecurity(
        {
          partner: partnerCheck
        },
        context
      );
      await check.getUserRoles();
      check.can({ action: "canBeDeactivated" });
      expect(check.check()).to.equal(
        true,
        "should be able to deactivate if I am planner, status is requested"
      );

      const partnerCheck2 = {
        ...partner,
        partners: [{ accountId: context.accountId, status: "cancelled" }]
      };
      const check2 = new CheckPartnershipSecurity(
        {
          partner: partnerCheck2
        },
        context
      );
      await check2.getUserRoles();
      check2.can({ action: "canBeDeactivated" });
      expect(check2.check()).to.equal(
        false,
        "should not be able to deactivate if I am planner, partnership status is cancelled"
      );
    });
    it("[canAcceptRejectRequest] allows/denies", async function() {
      const partnerCheck = {
        ...partner,
        partners: [
          { accountId: context.accountId, status: "requested", requestor: true }
        ]
      };
      const check = new CheckPartnershipSecurity(
        {
          partner: partnerCheck
        },
        context
      );
      await check.getUserRoles();
      check.can({ action: "canAcceptRejectRequest" });

      expect(check.check()).to.equal(
        true,
        "should be able to accept if I am planner, status is requested and I am requestor"
      );

      const partnerCheck2 = {
        ...partner,
        partners: [
          {
            accountId: context.accountId,
            status: "cancelled",
            requestor: false
          }
        ]
      };
      const check2 = new CheckPartnershipSecurity(
        {
          partner: partnerCheck2
        },
        context
      );
      await check2.getUserRoles();
      check2.can({ action: "canAcceptRejectRequest" });

      expect(check2.check()).to.equal(
        false,
        "should not be able to reject if I am planner, partnership status is requested and i am not requestor"
      );
    });
    it("[canResendRequest] allows/denies", async function() {
      const partnerCheck = {
        ...partner,
        partners: [
          {
            accountId: context.accountId,
            status: "requested",
            requestor: false
          }
        ]
      };
      const check = new CheckPartnershipSecurity(
        {
          partner: partnerCheck
        },
        context
      );
      await check.getUserRoles();
      check.can({ action: "canResendRequest" });

      expect(check.check()).to.equal(
        true,
        "should be able to resend if I am planner, status is requested and I am requestor"
      );

      const partnerCheck2 = {
        ...partner,
        partners: [
          { accountId: context.accountId, status: "cancelled", requestor: true }
        ]
      };
      const check2 = new CheckPartnershipSecurity(
        {
          partner: partnerCheck2
        },
        context
      );
      await check2.getUserRoles();
      check2.can({ action: "canResendRequest" });

      expect(check2.check()).to.equal(
        false,
        "should not be able to reject if I am planner, partnership status is cancelled and i am not requestor"
      );
    });
    it("[canBeReactivated] allows/denies", async function() {
      const partnerCheck = {
        ...partner,
        partners: [
          { accountId: context.accountId, status: "inactive", requestor: false }
        ]
      };
      const check = new CheckPartnershipSecurity(
        {
          partner: partnerCheck
        },
        context
      );
      await check.getUserRoles();
      check.can({ action: "canBeReactivated" });
      check.check();
      expect(check.check()).to.equal(
        true,
        "should be able to Reactivate if I am planner, status is active, I am requestor"
      );

      const partnerCheck2 = {
        ...partner,
        partners: [
          { accountId: context.accountId, status: "cancelled", requestor: true }
        ]
      };
      const check2 = new CheckPartnershipSecurity(
        {
          partner: partnerCheck2
        },
        context
      );
      await check2.getUserRoles();
      check2.can({ action: "canBeReactivated" });

      expect(check2.check()).to.equal(
        false,
        "should not be able to reactivate if I am planner, partnership status is requested"
      );
    });

    // FIXME:
    it("[canAnnotatePartner]", function() {});
  });
  describe("security own account", function() {
    let account;
    const contextOwner = { accountId: ACCOUNT_ID, userId: USER_ID };
    const contextOther = { accountId: OTHER_ACCOUNT_ID, userId: OTHER_USER_ID };
    before(async function() {
      account = await AllAccounts.first(ACCOUNT_ID);
    });
    it("[canEditUsers], other user", async function() {
      const check1 = new CheckAccountSecurity({ account }, contextOwner);
      await check1.getUserRoles();
      check1.can({
        action: "canEditUsers",
        data: { userId: Random.id(), roles: ["user"] }
      });
      expect(check1.check()).to.equal(
        true,
        "should be able to edit users if I am admin"
      );

      const check2 = new CheckAccountSecurity({ account }, contextOther);
      await check2.getUserRoles();
      check2.can({ action: "canEditUsers" });

      expect(check2.check()).to.equal(
        false,
        "should not be able to edit users of other account"
      );
    });
    it("[canEditFuelModel]", async function() {
      const check1 = new CheckAccountSecurity({ account }, contextOwner);
      await check1.getUserRoles();
      check1.can({
        action: "canEditFuelModel",
        data: { fuelAccountId: contextOwner.accountId }
      });

      expect(check1.check()).to.equal(true);

      const check2 = new CheckAccountSecurity({ account }, contextOther);
      await check2.getUserRoles();
      check2.can({
        action: "canEditFuelModel",
        data: { fuelAccountId: context.accountId }
      });
      expect(check2.check()).to.equal(
        false,
        "should not be able to edit fuel of other account"
      );
    });
  });

  // describe("service", function() {
  //   let partnerId;
  //   let inviteUserId;
  //   before(function() {
  //     this.timeout(15000);
  //     accountId = AccountService.generateId("shipper");
  //     createMockUsers("planner", accountId);
  //     createRole("admin");
  //     partnerId = AccountService.generateId("carrier");
  //     createMockUsers("planner", partnerId);
  //     createMockUsers("admin", accountId, partnerId);

  //     // account document for 1:
  //     const data1 = accountTestData.dbData({ type: "shipper" });
  //     data1._id = accountId;
  //     AllAccounts._collection.direct.insert(data1);

  //     // account document for 2:
  //     const data2 = accountTestData.dbData({ type: "carrier" });
  //     data2._id = partnerId;
  //     AllAccounts._collection.direct.insert(data2);
  //   });

  //   it("we invite the same user again, same userid should be received", function() {
  //     const { userId } = partnerContact
  //       .init({ partnerId, accountId })
  //       .createUserIfNotExists({
  //         contact: { mail: "test-createUserIfNotExists@test.be" },
  //         options: { sendInvite: true }
  //       })
  //       .addToContacts()
  //       .get();

  //     expect(userId).to.be.a("string");
  //     expect(userId).to.equal(inviteUserId);
  //   });
  // });

  // describe("annotation", function() {
  //   before(function() {
  //     this.timeout(5000);
  //     updateUserRole(["planner"]);
  //   });
  //   it("retrieves my annotation data", function() {
  //     const data = accountTestData.dbData({ type: "carrier" });
  //     const profile = accountTestData.profileData();
  //     const partnerId = AllAccounts._collection.direct.insert({
  //       ...data,
  //       accounts: [
  //         { accountId: "someOtherId" },
  //         {
  //           accountId,
  //           profile
  //         }
  //       ]
  //     });

  //     const fn = () => {
  //       const accountRes = accountGetProfile.call({ accountId: partnerId });

  //       expect(accountRes.certificates).to.eql(profile.certificates);
  //       expect(accountRes.sites).to.eql(profile.sites);
  //       expect(accountRes.contacts).to.eql([]);
  //     };
  //     triggerDDPInvocation({ userId: users.eve.uid }, fn);
  //   });

  //   it("retrieves the profile data for an account (server function)", function() {
  //     // set data
  //     const data = accountTestData.dbData({ type: "carrier" });
  //     const profile = accountTestData.profileData();
  //     const partnerId = AllAccounts._collection.direct.insert({
  //       ...data,
  //       accounts: [
  //         { accountId: "someOtherId" },
  //         {
  //           accountId,
  //           profile
  //         }
  //       ]
  //     });

  //     // check if exists
  //     expect(partnerId).to.be.an("string");

  //     // get profile data by using function (without this.id())
  //     const result = AllAccounts.getProfileData({
  //       accountId: partnerId,
  //       myAccountId: accountId
  //     });
  //     debug("server getProfileData", result);
  //     expect(result).to.be.an("object");
  //     expect(result.profile).to.eql(profile);
  //   });
  // });
  // describe("directory", function() {
  //   describe("methods", function() {
  //     let account; // the invoker account of eve...
  //     before(function() {
  //       account = AllAccounts.first(accountId);
  //       updateUserRole(["planner"]);

  //       // add some dummy partner data with profile
  //       const addCarrier = override => {
  //         const dData = {
  //           ...accountTestData.dbData({ type: "carrier", profile: true }),
  //           ...override
  //         };
  //         AllAccounts._collection.direct.insert(dData);
  //       };
  //       [
  //         { partners: [{ accountId, status: "pending" }] },
  //         { shortlistedBy: [accountId] },
  //         { profile: { service: [] } },
  //         { profile: { footprint: [] } },
  //         undefined,
  //         undefined,
  //         undefined,
  //         undefined,
  //         undefined,
  //         undefined
  //       ].forEach(override => addCarrier(override));
  //     });
  //     it("[directory.query] returns the directory list", function() {
  //       const fn = () => {
  //         const res = queryDirectory.call({});

  //         // test length of result
  //         expect(res).to.have.lengthOf(10);
  //       };
  //       triggerDDPInvocation({ userId: users.eve.uid }, fn);
  //     });
  //     it("[account.favorite] allows me to add an account to my favorites", function() {
  //       const fn = () => {
  //         // we have 10 dummy partners in the db, we pick the first one:
  //         const partner = AllAccounts.first({ type: "carrier" });
  //         const res = accountFavorite.call({
  //           accountId: partner._id,
  //           add: true
  //         });

  //         // test length of result
  //         expect(res.shortlistedBy).to.include(account._id);
  //       };
  //       triggerDDPInvocation({ userId: users.eve.uid }, fn);
  //     });
  //   });
  // });
});
