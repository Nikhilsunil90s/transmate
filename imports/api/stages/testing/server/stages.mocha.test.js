/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
import { Meteor } from "meteor/meteor";
import { Random } from "/imports/utils/functions/random.js";
import { Roles } from "/imports/api/roles/Roles";
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection";
import { expect } from "chai";
import sinon from "sinon";
import moment from "moment";
import { JobManager } from "/imports/utils/server/job-manager.js";

import { CheckStageSecurity } from "/imports/utils/security/checkUserPermissionsForStage.js";
import {
  prepareShipmentWithStage,
  insertAddress
} from "../data/shipmentAndStage";
import { Stage } from "../../Stage";
import { Shipment } from "/imports/api/shipments/Shipment";
import { resolvers } from "../../apollo/resolvers";
import { Address } from "/imports/api/addresses/Address";
import { ShipmentItem } from "/imports/api/items/ShipmentItem";

const ACCOUNT_ID = "S65957";
const USER_ID = "jsBor6o3uRBTFoRQY";
const CARRIER_ID = "C11051";
const CARRIER_USER_ID = "pYFLYFDMJEnKADYXX";

const STAGE_ID = "mTQmzoCfAiLbGFzXX";
const SHIPMENT_ID = "2jG2mZFcaFzqaThXX";

const ADDRESS_ID_BRASIL = "vX2WZcLowBhyP87Mf";

let defaultMongo;
describe("stages async", function() {
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo");
      await defaultMongo.connect();
    }

    const resetDone = await resetDb({ resetUsers: true });
    if (!resetDone) throw Error("reset was not possible, test can not run!");
  });
  describe("model", function() {
    beforeEach(async function() {
      await resetCollections(["shipments", "stages", "items"]);
      return true;
    });
    it("[isReadyForRelease] check model method", async function() {
      const stage = await Stage.first(STAGE_ID);
      const { problems, pass } = await stage.isReadyForRelease();
      expect(problems).to.have.lengthOf(0, problems);
      expect(pass).to.equal(true);
    });
    it("[isReadyForRelease] - wrong status", async function() {
      await Stage._collection.update(
        { _id: STAGE_ID },
        { $set: { status: "started" } }
      );
      const stage = await Stage.first(STAGE_ID);
      const { problems, pass } = await stage.isReadyForRelease();

      expect(problems).to.include("status");
      expect(pass).to.equal(false);
    });
    it("[isReadyForRelease] - no shipper set", async function() {
      await Shipment._collection.update(
        { _id: SHIPMENT_ID },
        { $unset: { shipperId: 1 } }
      );
      const stage = await Stage.first(STAGE_ID);
      const { problems, pass } = await stage.isReadyForRelease();

      expect(problems).to.include("shipper");
      expect(pass).to.equal(false);
    });
    it("[isReadyForRelease] - no items", async function() {
      await ShipmentItem._collection.remove({ shipmentId: SHIPMENT_ID });
      const stage = await Stage.first(STAGE_ID);
      const { problems, pass } = await stage.isReadyForRelease();
      expect(problems).to.include("items");
      expect(pass).to.equal(false);
    });
    it("[isReadyForRelease] - no items", async function() {
      await ShipmentItem._collection.remove({ shipmentId: SHIPMENT_ID });
      const stage = await Stage.first(STAGE_ID);
      const { problems, pass } = await stage.isReadyForRelease();
      expect(problems).to.include("items");
      expect(pass).to.equal(false);
    });
    it("[isReadyForRelease] - no carrier", async function() {
      await Stage._collection.update(
        { _id: STAGE_ID },
        { $unset: { carrierId: 1 } }
      );
      const stage = await Stage.first(STAGE_ID);
      const { problems, pass } = await stage.isReadyForRelease();
      expect(problems).to.include("carrierId");
      expect(pass).to.equal(false);
    });
    it("[isReadyForRelease] - no dates", async function() {
      await Stage._collection.update(
        { _id: STAGE_ID },
        { $unset: { "dates.pickup.arrival.planned": 1 } }
      );
      const stage = await Stage.first(STAGE_ID);
      const { problems, pass } = await stage.isReadyForRelease();
      expect(problems).to.include("fields");
      expect(pass).to.equal(false);
    });
  });
  describe("security", function() {
    let shipment;
    let stage;
    const userId = USER_ID;
    const accountId = ACCOUNT_ID;
    const carrierId = CARRIER_ID;
    before(async function() {
      await Promise.all([
        Shipment._collection.remove({}),
        Stage._collection.remove({})
      ]);
      ({ shipment, stage } = await prepareShipmentWithStage({
        userId,
        accountId
      }));
    });
    beforeEach(function() {
      Meteor.setUserId && Meteor.setUserId(userId);
    });
    it("[updateStage][allow]checks update stage", async function() {
      // allow: update certain fields in stage (of own shipment) when I am planner

      const update = { status: "completed" };
      const srv = new CheckStageSecurity(
        {
          stage,
          update,
          shipment
        },
        {
          accountId,
          userId
        }
      );
      await srv.getUserRoles();
      const res = srv.can({ action: "updateStage" }).check();
      expect(res).to.equal(true);
    });
    it("[updateStage][throws]when not planner/admin", async function() {
      // modify user role:
      await Roles.createRole("user", { unlessExists: true });
      await Roles.removeUsersFromRoles(
        userId,
        ["planner", "admin"],
        `account-${accountId}`
      );
      await Roles.addUsersToRoles(userId, ["user"], `account-${accountId}`);

      let testError;
      try {
        const update = { status: "completed" };
        const check = new CheckStageSecurity(
          {
            stage,
            update,
            shipment
          },
          {
            accountId,
            userId
          }
        );
        await check.getUserRoles();
        check.can({ action: "updateStage" }).throw();
      } catch (error) {
        testError = error;
      }
      expect(testError).to.be.an("error");
      expect(testError.message).to.match(/not-allowed/);

      // restore user:
      await Roles.addUsersToRoles(userId, ["planner"], `account-${accountId}`);
    });
    it("[update][throws] wrong fields", async function() {
      let testError;
      try {
        const update = { wrongField: "completed" };
        const check = new CheckStageSecurity(
          {
            stage,
            update,
            shipment
          },
          {
            accountId,
            userId
          }
        );
        await check.getUserRoles();
        check.can({ action: "updateStage" }).throw();
      } catch (error) {
        testError = error;
      }
      expect(testError).to.be.an("error");
      expect(testError.message).to.match(/not-allowed/);
    });
    it("[update][throws]shipment in canceled status", async function() {
      let testError;
      try {
        const update = { status: "completed" };
        const check = new CheckStageSecurity(
          {
            stage,
            update,
            shipment: { ...shipment, status: "canceled" }
          },
          {
            accountId,
            userId
          }
        );
        await check.getUserRoles();
        check.can({ action: "updateStage" }).throw();
      } catch (error) {
        testError = error;
      }
      expect(testError).to.be.an("error");
      expect(testError.message).to.match(/not-allowed/);
    });
    it("[splitStage][allows] splitting a stage", async function() {
      // (of owns shipment), when I am a planner
      const srv = new CheckStageSecurity(
        {
          stage,
          shipment
        },
        {
          accountId,
          userId
        }
      );
      await srv.getUserRoles();
      const res = srv.can({ action: "updateStage" }).check();
      expect(res).to.equal(true);
    });
    it("[split][throws]when not planner/admin", async function() {
      // modify user role:
      await Roles.createRole("user", { unlessExists: true });
      await Roles.removeUsersFromRoles(
        userId,
        ["planner", "admin"],
        `account-${accountId}`
      );
      await Roles.addUsersToRoles(userId, ["user"], `account-${accountId}`);

      let testError;
      try {
        const check = new CheckStageSecurity(
          {
            stage,
            shipment
          },
          {
            accountId,
            userId
          }
        );
        await check.getUserRoles();
        check.can({ action: "splitStage" }).throw();
      } catch (error) {
        testError = error;
      }
      expect(testError).to.be.an("error");
      expect(testError.message).to.match(/not-allowed/);

      // restore user:
      await Roles.addUsersToRoles(userId, ["planner"], `account-${accountId}`);
    });
    it("[split][throws] when shipment in canceled status", async function() {
      let testError;
      try {
        const check = new CheckStageSecurity(
          {
            stage,
            shipment: { ...shipment, status: "canceled" }
          },
          {
            accountId,
            userId
          }
        );
        await check.getUserRoles();
        check.can({ action: "splitStage" }).throw();
      } catch (error) {
        testError = error;
      }
      expect(testError).to.be.an("error");
      expect(testError.message).to.match(/not-allowed/);
    });
    it("[split][throws] when stage in wrong status", async function() {
      // modify shipment: status canceled
      let testError;
      try {
        const check = new CheckStageSecurity(
          {
            stage: { ...stage, status: "completed" },
            shipment
          },
          {
            accountId,
            userId
          }
        );
        await check.getUserRoles();
        check.can({ action: "splitStage" }).throw();
      } catch (error) {
        testError = error;
      }
      expect(testError).to.be.an("error");
      expect(testError.message).to.match(/not-allowed/);
    });
    it("[allocate][allows]", async function() {
      //  allocating a driver (of own shipment|| if carrier in shipment) & when I am a planner
      const srv = new CheckStageSecurity(
        {
          stage,
          shipment
        },
        {
          accountId,
          userId
        }
      );
      await srv.getUserRoles();
      const res = srv.can({ action: "splitStage" }).check();
      expect(res).to.equal(true);
    });
    it("[confirmStage][allows]", async function() {
      // when carrier or owner, status planned/started - user is planner
      const srv = new CheckStageSecurity(
        {
          stage: { ...stage, status: "planned" },
          shipment
        },
        {
          accountId,
          userId
        }
      );
      await srv.getUserRoles();
      const res = srv.can({ action: "confirmStage" }).check();
      expect(res).to.equal(true);
    });
    it("[canRelease][allows] when carrier/owner/shipper, status draft - user is planner", async function() {
      const srv = new CheckStageSecurity(
        {
          stage: { ...stage, status: "draft" },
          shipment
        },
        {
          accountId,
          userId
        }
      );
      await srv.getUserRoles();
      const res = srv.can({ action: "canRelease" }).check();
      expect(res).to.equal(true);
    });
    it("[canSchedule][allows] when carrier, status is draft/planned", async function() {
      Meteor.setUserId && Meteor.setUserId(CARRIER_USER_ID);
      const srv = new CheckStageSecurity(
        {
          stage: { ...stage, status: "planned", carrierId },
          shipment
        },
        {
          accountId: carrierId,
          userId: CARRIER_USER_ID
        }
      );
      await srv.getUserRoles();
      const res = srv.can({ action: "canSchedule" }).check();
      expect(res).to.equal(true);

      const { roleInStage } = new CheckStageSecurity(
        {
          stage: { ...stage, status: "planned", carrierId },
          shipment
        },
        {
          accountId: carrierId,
          userId: CARRIER_USER_ID
        }
      );
      expect(roleInStage.isCarrier).to.equal(true);

      // restore
      Meteor.setUserId && Meteor.setUserId(USER_ID);
    });
    it("[modifyPlannedDates][allows] when in draft, and I am owner/shipper/carrier", async function() {
      const srv = new CheckStageSecurity(
        {
          stage,
          shipment
        },
        {
          accountId,
          userId
        }
      );
      await srv.getUserRoles();
      const res = srv.can({ action: "modifyPlannedDates" }).check();
      expect(res).to.equal(true);
    });
    it("[changeMode][allows] when in draft, and I am owner/shipper/carrier ", async function() {
      const srv = new CheckStageSecurity(
        {
          stage: { ...stage, status: "draft" },
          shipment
        },
        {
          accountId,
          userId
        }
      );
      await srv.getUserRoles();
      const res = srv.can({ action: "changeMode" }).check();
      expect(res).to.equal(true);
    });
    it("[changeCarrier][allows] when in draft, and I am owner/shipper and if there are multiple stages and already assigned", async function() {
      const srv = new CheckStageSecurity(
        {
          stage: { ...stage, status: "draft", carrierId },
          shipment
        },
        {
          accountId,
          userId
        }
      );
      await srv.getUserRoles();
      const res = srv
        .can({ action: "changeCarrier", data: { count: 2 } })
        .check();
      expect(res).to.equal(true);

      // not if there is no assigned carrier:
      const srv2 = new CheckStageSecurity(
        {
          stage: { ...stage, status: "draft", carrierId: undefined },
          shipment
        },
        {
          accountId,
          userId
        }
      );
      await srv2.getUserRoles();
      const res2 = srv2
        .can({ action: "changeCarrier", data: { count: 2 } })
        .check();
      expect(res2).to.equal(false);

      // not if there is no other stage:
      const srv3 = new CheckStageSecurity(
        {
          stage: { ...stage, status: "draft", carrierId },
          shipment
        },
        {
          accountId,
          userId
        }
      );
      await srv3.getUserRoles();
      const res3 = srv3
        .can({ action: "changeCarrier", data: { count: 1 } })
        .check();
      expect(res3).to.equal(false);
    });
    it("[viewAssignedCarrier][allows] owner to view and partners if confirmed", async function() {
      const srv = new CheckStageSecurity(
        {
          stage: { ...stage, status: "draft", carrierId },
          shipment
        },
        {
          accountId,
          userId
        }
      );
      await srv.getUserRoles();
      const res = srv.can({ action: "viewAssignedCarrier" }).check();
      expect(res).to.equal(true);

      // carrier can't see when in draft status
      Meteor.setUserId && Meteor.setUserId(CARRIER_USER_ID);
      const srv2 = new CheckStageSecurity(
        {
          stage: { ...stage, status: "draft", carrierId },
          shipment
        },
        {
          accountId: carrierId,
          userId: CARRIER_USER_ID
        }
      );
      await srv2.getUserRoles();
      const res2 = srv2.can({ action: "viewAssignedCarrier" }).check();
      expect(res2).to.equal(false);

      Meteor.setUserId && Meteor.setUserId(CARRIER_USER_ID);
      const srv3 = new CheckStageSecurity(
        {
          stage: { ...stage, status: "planned", carrierId },
          shipment
        },
        {
          accountId: carrierId,
          userId: CARRIER_USER_ID
        }
      );
      await srv3.getUserRoles();
      const res3 = srv3.can({ action: "viewAssignedCarrier" }).check();
      expect(res3).to.equal(true);
    });
    it("[assignDriver][allows] when status planned/started, I am carrier", async function() {
      Meteor.setUserId && Meteor.setUserId(CARRIER_USER_ID);
      const srv = new CheckStageSecurity(
        {
          stage: { ...stage, status: "planned", carrierId },
          shipment
        },
        {
          accountId: carrierId,
          userId: CARRIER_USER_ID
        }
      );
      await srv.getUserRoles();
      const res = srv.can({ action: "assignDriver" }).check();
      expect(res).to.equal(true);

      const { roleInStage } = srv;
      expect(roleInStage.isCarrier).to.equal(true);
    });
    it("[confirmDates]allows when status planned/started, as carrier/owner", async function() {
      const srv = new CheckStageSecurity(
        {
          stage: { ...stage, status: "planned" },
          shipment
        },
        {
          accountId,
          userId
        }
      );
      await srv.getUserRoles();
      const res = srv.can({ action: "confirmDates" }).check();
      expect(res).to.equal(true);
    });
    it("[putBackToDraft]allows when owner, status planned/started", async function() {
      const srv = new CheckStageSecurity(
        {
          stage: { ...stage, status: "planned" },
          shipment
        },
        {
          accountId,
          userId
        }
      );
      await srv.getUserRoles();
      const res = srv.can({ action: "putBackToDraft" }).check();
      expect(res).to.equal(true);
    });
    it("[mergeStages]allows when owner, status planned/started - next stage should be draft", async function() {
      const srv = new CheckStageSecurity(
        {
          stage: { ...stage, status: "draft" },
          shipment
        },
        {
          accountId,
          userId
        }
      );
      await srv.getUserRoles();
      const res = srv
        .can({
          action: "mergeStages",
          data: { nextStage: { status: "draft" } }
        })
        .check();
      expect(res).to.equal(true);
      expect(srv.roleInShipment.isOwner).to.equal(true);
    });
  });
  describe("[update] stage update", function() {
    let shipmentId;
    let stageId;
    const context = {
      accountId: ACCOUNT_ID,
      userId: USER_ID
    };
    beforeEach(async function() {
      await Promise.all([
        Shipment._collection.remove({}),
        Stage._collection.remove({})
      ]);
      const { shipment, stage } = await prepareShipmentWithStage(context);
      shipmentId = shipment._id;
      stageId = stage._id;

      Meteor.setUserId && Meteor.setUserId(context.userId);
    });
    it("throws an error when not logged in", async function() {
      let testError;
      try {
        await resolvers.Mutation.updateStage(null, { input: {} }, {});
      } catch (error) {
        testError = error;
      }
      expect(testError).to.be.an("error");
      expect(testError.message).to.match(/not-authorized/);
    });
    it("updates a stage - update mode", async function() {
      expect(shipmentId).to.be.an("string");
      expect(stageId).to.be.an("string");

      const input = { updates: { mode: "ocean" }, stageId };
      await resolvers.Mutation.updateStage(null, { input }, context);

      const testStage = await Stage.first(stageId, { fields: { mode: 1 } });
      const testShipment = await Shipment.first(shipmentId, { type: 1 });

      expect(testStage.mode).to.equal("ocean");
      expect(testShipment.type).to.equal("ocean");
    });
    it("updates a stage - update should flag stage complete", async function() {
      // stage status should be started:
      await Stage._collection.update(
        { _id: stageId },
        { $set: { status: "started" } }
      );

      const input = {
        stageId,
        updates: {
          dates: {
            pickup: {
              arrival: {
                actual: moment()
                  .subtract(1, "day")
                  .toDate()
              }
            },
            delivery: {
              arrival: {
                actual: moment()
                  .add(1, "day")
                  .toDate()
              }
            }
          }
        }
      };

      // update:
      await resolvers.Mutation.updateStage(null, { input }, context);

      const testStage = await Stage.first(stageId, { fields: { status: 1 } });
      const testShipment = await Shipment.first(shipmentId, { status: 1 });

      expect(testStage.status).to.equal("completed");
      expect(testShipment.status).to.equal("completed");
    });
    it("updates a stage - actual pickup date", async function() {
      expect(shipmentId).to.be.an("string");
      expect(stageId).to.be.an("string");

      const input = {
        stageId,
        updates: {
          "dates.pickup.arrival.actual": new Date()
        }
      };

      await resolvers.Mutation.updateStage(null, { input }, context);

      // runChecks (needs meteor roles...)
      const testStage = await Stage.first(stageId, {
        fields: { dates: 1, status: 1 }
      });

      // is triggered in after_save
      const testShipment = await Shipment.first(shipmentId, {
        fields: {
          pickup: 1,
          status: 1
        }
      });

      expect(testStage.status).to.equal("started");
      expect(testStage.dates.pickup.arrival.actual).to.not.equal(undefined);
      expect(testShipment.pickup.dateActual).to.not.equal(undefined);
      expect(testShipment.status).to.equal("started");
    });
  });
  describe("[status] update status", function() {
    let shipmentId;
    let stageId;
    const context = {
      accountId: ACCOUNT_ID,
      userId: USER_ID
    };
    beforeEach(async function() {
      await Promise.all([
        Shipment._collection.remove({}),
        Stage._collection.remove({})
      ]);
      const { shipment, stage } = await prepareShipmentWithStage(context);
      shipmentId = shipment._id;
      stageId = stage._id;
      Meteor.setUserId && Meteor.setUserId(context.userId);
    });
    it("throws an error when not logged in", async function() {
      let testError;
      try {
        await resolvers.Mutation.setStageStatus(null, {}, {});
      } catch (error) {
        testError = error;
      }
      expect(testError).to.be.an("error");
      expect(testError.message).to.match(/not-authorized/);
    });
    it("status to draft", async function() {
      // when logged in + stage.status == draft| planned
      // prep data:
      await Stage._collection.update(
        { _id: stageId },
        { $set: { status: "planned" } }
      );

      // action:
      const args = { stageId, status: "draft" };
      await resolvers.Mutation.setStageStatus(null, args, context);

      // test:
      const updatedDoc = await Stage.first(stageId);
      expect(updatedDoc.status).to.equal("draft");
    });
    it("[setStageStatus][release] allows releasing a stage when all conditions are met", async function() {
      // conditions to be met:
      // stage == draft
      // shipment has shipperId
      // shipment has items
      // shipment has from & to
      // stage has carrierId
      // shipment has dates set in pickup & delivery
      await Stage._collection.update(
        { _id: stageId },
        { $set: { status: "draft", carrierId: "C12345" } }
      );

      // setup spy:
      // to do : this will not trigger , only if job runs

      const notificationSpy = sinon.spy();
      JobManager.on("shipment-stage.released", "Test", notificationSpy);

      await await resolvers.Mutation.setStageStatus(
        null,
        { stageId, status: "release" },
        context
      );

      const updatedDoc = await Stage.first(stageId);
      expect(updatedDoc.status).to.equal("planned");

      // check if event is fired:
      expect(
        notificationSpy.callCount,
        "a notification can not run yet as we don't start job server!"
      ).to.equal(0);
    });
  });
  describe("[allocate]", function() {
    let shipmentId;
    let stageId;
    const context = {
      accountId: CARRIER_ID,
      userId: CARRIER_USER_ID
    };
    beforeEach(async function() {
      await Promise.all([
        Shipment._collection.remove({}),
        Stage._collection.remove({})
      ]);
      const { shipment, stage } = await prepareShipmentWithStage(context);
      shipmentId = shipment._id;
      stageId = stage._id;

      Meteor.setUserId && Meteor.setUserId(context.userId);
    });
    it("throws an error when not logged in", async function() {
      let testError;
      try {
        await resolvers.Mutation.allocateStage(null, { input: {} }, {});
      } catch (error) {
        testError = error;
      }
      expect(testError).to.be.an("error");
      expect(testError.message).to.match(/not-authorized/);
    });
    it("allows allocating a driver as carrier", async function() {
      // stage.stats == draft| planned
      // carrier is assigned
      await Stage._collection.update(
        { _id: stageId },
        { $set: { status: "planned", carrierId: CARRIER_ID } }
      );

      const input = {
        stageId,
        allocation: {
          driverId: Random.id(),
          plate: "some plate",
          instructions: "some instructions"
        }
      };
      const res = await resolvers.Mutation.allocateStage(
        null,
        { input },
        context
      );

      expect(res.plate).to.equal(input.allocation.plate);
    });
  });
  describe("[split]", function() {
    let shipmentId;
    let stageId;
    const context = {
      accountId: ACCOUNT_ID,
      userId: USER_ID
    };
    beforeEach(async function() {
      await Promise.all([
        Shipment._collection.remove({}),
        Stage._collection.remove({})
      ]);
      const { shipment, stage } = await prepareShipmentWithStage(context);
      shipmentId = shipment._id;
      stageId = stage._id;

      Meteor.setUserId && Meteor.setUserId(context.userId);
    });
    it("throws an error when not logged in", async function() {
      let testError;
      try {
        await resolvers.Mutation.updateStage(null, { input: {} }, {});
      } catch (error) {
        testError = error;
      }
      expect(testError).to.be.an("error");
      expect(testError.message).to.match(/not-authorized/);
    });

    it("allows splitting a stage", async function() {
      // when logged in + stage.stats == draft

      // prepare data:
      const addressId = await insertAddress(ACCOUNT_ID);
      await Stage._collection.update(
        { _id: stageId },
        { $set: { status: "draft" } }
      );

      const startStageCount = await Stage.count({ shipmentId });
      expect(startStageCount, "start # stage should be 1!").to.equal(1);

      // action:
      const args = { stageId, location: { id: addressId, type: "address" } };
      await resolvers.Mutation.splitStage(null, args, context);

      // test:
      const [
        stagecount,
        firstStage,
        secondStage,
        shipment
      ] = await Promise.all([
        Stage.count({ shipmentId }),
        Stage.first({ shipmentId, sequence: 1 }),
        Stage.first({ shipmentId, sequence: 2 }),
        Shipment.first(shipmentId, { fields: { stageIds: 1 } })
      ]);

      expect(stagecount, "we should have 2 stage now.").to.equal(2);
      expect(
        shipment.stageIds,
        `we should have 2 ids now , we have these now ${JSON.stringify(
          shipment.stageIds
        )}`
      ).to.have.lengthOf(2);
      expect(firstStage).to.not.equal(undefined);
      expect(firstStage.to.addressId).to.equal(addressId);
      expect(secondStage).to.not.equal(undefined);
      expect(secondStage.from.addressId).to.equal(addressId);
    });
  });
  describe("[merge]", function() {
    let shipmentId;
    let stageId;
    const context = {
      accountId: ACCOUNT_ID,
      userId: USER_ID
    };
    beforeEach(async function() {
      await Promise.all([
        Shipment._collection.remove({}),
        Stage._collection.remove({})
      ]);
      const { shipment, stage } = await prepareShipmentWithStage(context);
      shipmentId = shipment._id;
      stageId = stage._id;

      Meteor.setUserId && Meteor.setUserId(context.userId);
      return null;
    });
    it("throws an error when not logged in", async function() {
      let testError;
      try {
        await resolvers.Mutation.mergeStage(null, {}, {});
      } catch (error) {
        testError = error;
      }
      expect(testError).to.be.an("error");
      expect(testError.message).to.match(/not-authorized/);
    });
    it("allows merging stages", async function() {
      // when a second mergeable stage exists

      // prepare data:
      const addressId = await insertAddress(ACCOUNT_ID);
      await Stage._collection.update(
        { _id: stageId },
        { $set: { status: "draft" } }
      );

      const args = { stageId, location: { id: addressId, type: "address" } };
      await resolvers.Mutation.splitStage(null, args, context);

      const firstStage = await Stage.first({ shipmentId, sequence: 1 });

      // test:
      await resolvers.Mutation.mergeStage(
        null,
        { stageId: firstStage.id },
        context
      );
      const [count, shipment] = await Promise.all([
        Stage.count({ shipmentId }),
        Shipment.first(shipmentId, { fields: { stageIds: 1 } })
      ]);
      expect(count).to.equal(1);
      expect(shipment.stageIds).to.have.lengthOf(1);
    });
  });
  describe("[addrUpdate]", function() {
    let shipmentId;
    let stageId;
    const context = {
      accountId: ACCOUNT_ID,
      userId: USER_ID
    };
    beforeEach(async function() {
      await Promise.all([
        Shipment._collection.remove({}),
        Stage._collection.remove({})
      ]);
      const { shipment, stage } = await prepareShipmentWithStage(context);
      shipmentId = shipment._id;
      stageId = stage._id;

      Meteor.setUserId && Meteor.setUserId(context.userId);
    });
    it("[updateStageLocation]throws an error when not logged in", async function() {
      let testError;
      try {
        await resolvers.Mutation.updateStageLocation(null, { input: {} }, {});
      } catch (error) {
        testError = error;
      }
      expect(testError).to.be.an("error");
      expect(testError.message).to.match(/not-authorized/);
    });
    it("[updateStageLocation][addressId]allows updating a stage address", async function() {
      // when logged in + stage.status == draft

      // prepare data:
      const addressId = await insertAddress(ACCOUNT_ID);
      await Stage._collection.update(
        { _id: stageId },
        { $set: { status: "draft" } }
      );

      // action
      const input = {
        stageId,
        stop: "from",
        location: {
          type: "address",
          id: addressId
        }
      };
      await resolvers.Mutation.updateStageLocation(null, { input }, context);

      const [updatedStage, updatedShipment] = await Promise.all([
        Stage.first(stageId),
        Shipment.first(shipmentId)
      ]);

      expect(updatedStage.from.addressId).to.equal(addressId);
      expect(updatedShipment.pickup.location.addressId).to.equal(addressId);
    });
    it("[updateStageLocation][addressId]allows updating a stage address > with timeZone", async function() {
      await Stage._collection.update(
        { _id: stageId },
        { $set: { status: "draft" } }
      );

      // action
      const input = {
        stageId,
        stop: "from",
        location: {
          type: "address",
          id: ADDRESS_ID_BRASIL
        }
      };
      const res = await resolvers.Mutation.updateStageLocation(
        null,
        { input },
        context
      );

      expect(res).to.not.equal(undefined);

      const [updatedStage, updatedShipment] = await Promise.all([
        Stage.first(stageId),
        Shipment.first(shipmentId)
      ]);

      expect(updatedStage.from.addressId).to.equal(ADDRESS_ID_BRASIL);
      expect(updatedShipment.pickup.location.addressId).to.equal(
        ADDRESS_ID_BRASIL
      );

      // test the timeZone that is set:
      expect(updatedStage.from.timeZone).to.equal("America/Sao_Paulo");
    });
    it("[updateStageLocation][addressId]allows updating a stage address (to)", async function() {
      // while modifying the next stage as well
      // 0. split stage to make sure there are 2
      // 1. update to address in first stage

      // prepare data:
      const [addressId, addressId2] = await Promise.all([
        insertAddress(ACCOUNT_ID),
        insertAddress(ACCOUNT_ID)
      ]);
      await Stage._collection.update(
        { _id: stageId },
        { $set: { status: "draft" } }
      );

      const args = { stageId, location: { id: addressId, type: "address" } };
      await resolvers.Mutation.splitStage(null, args, context);

      const [stage1, stage2] = await Promise.all([
        Stage.first({ shipmentId, sequence: 1 }),
        Stage.first({ shipmentId, sequence: 2 })
      ]);
      expect(stage1).to.not.equal(undefined);
      expect(stage2).to.not.equal(undefined);

      // action:
      const input = {
        stageId: stage1.id,
        stop: "to",
        location: {
          type: "address",
          id: addressId2
        }
      };

      await resolvers.Mutation.updateStageLocation(null, { input }, context);

      // 2. checks
      const [uStage1, uStage2] = await Promise.all([
        Stage.first({ shipmentId, sequence: 1 }),
        Stage.first({ shipmentId, sequence: 2 })
      ]);
      expect(uStage1).to.not.equal(undefined);
      expect(uStage2).to.not.equal(undefined);
      expect(uStage1.to.addressId).to.equal(addressId2);
      expect(uStage2.from.addressId).to.equal(addressId2);
    });

    it("[updateStageLocation][overrides] allows overriding of the address accounts, stage to/from and shipment pickup/delivery objects", async function() {
      await Stage._collection.update(
        { _id: stageId },
        { $set: { status: "draft" } }
      );

      // action
      const input = {
        stageId,
        stop: "from",
        overrides: {
          city: "City",
          countryCode: "AE",
          street: "street1",
          number: "43",
          name: "San Frisco"
        }
      };
      await resolvers.Mutation.updateStageLocation(null, { input }, context);

      const [updatedStage, updatedShipment] = await Promise.all([
        Stage.first(stageId, { fields: { from: 1 } }),
        Shipment.first(shipmentId, { fields: { pickup: 1 } })
      ]);

      expect(updatedStage.from.countryCode).to.equal("AE");
      expect(updatedStage.from.address.street).to.equal("street1");
      expect(updatedStage.from.address.number).to.equal("43");
      expect(updatedStage.from.address.city).to.equal("City");

      expect(updatedShipment.pickup.location.countryCode).to.equal("AE");
      expect(updatedShipment.pickup.location.address.street).to.equal(
        "street1"
      );
      expect(updatedShipment.pickup.location.address.number).to.equal("43");
      expect(updatedShipment.pickup.location.address.city).to.equal("City");

      const { addressId } = updatedStage.from;
      const addressUpdated = await Address.first(
        addressId,
        Address.projectFields(ACCOUNT_ID)
      );

      expect(addressUpdated.accounts[0].overrides.countryCode).to.equal("AE");
      expect(addressUpdated.accounts[0].overrides.street).to.equal("street1");
      expect(addressUpdated.accounts[0].overrides.number).to.equal("43");
      expect(addressUpdated.accounts[0].overrides.city).to.equal("City");
    });
  });
  describe("[confirmStage]", function() {
    const context = {
      accountId: ACCOUNT_ID,
      userId: USER_ID
    };
    beforeEach(async function() {
      await resetCollections(["shipments", "stages"]);
      return true;
    });
    it("[throws] an error when not logged in", async function() {
      let result;
      try {
        result = await resolvers.Mutation.confirmStage(null, { input: {} }, {});
      } catch (error) {
        result = error;
      }
      expect(result).to.be.an("error");
      expect(result.message).to.match(/not-authorized/);
    });
    it("confirms stage", async function() {
      this.timeout(10000);

      // pre-requirements: shipment that is released (carrier set & status:)
      const shipmentRes = await resolvers.Mutation.setStageStatus(
        null,
        { stageId: STAGE_ID, status: "release" },
        context
      );

      expect(shipmentRes).to.not.equal(undefined);
      expect(shipmentRes.status).to.equal("planned");
      expect(shipmentRes.stages[0].status).to.equal("planned");

      const dateUpdate = new Date();
      const input = {
        stageId: STAGE_ID,
        dates: { pickupArrival: dateUpdate.getTime(), deliveryArrival: null }
      };
      const shipmentRes2 = await resolvers.Mutation.confirmStage(
        null,
        { input },
        context
      );

      expect(shipmentRes2).to.not.equal(undefined);
      expect(shipmentRes2.status).to.equal("started");
      expect(shipmentRes2.stages[0].status).to.equal("started");
      expect(shipmentRes2.stages[0].dates.pickup?.arrival?.actual).to.eql(
        dateUpdate
      );

      const dateUpdate2 = new Date();
      const input2 = {
        stageId: STAGE_ID,
        dates: {
          pickupArrival: dateUpdate.getTime(),
          deliveryArrival: dateUpdate2.getTime()
        }
      };
      const shipmentRes3 = await resolvers.Mutation.confirmStage(
        null,
        { input: input2 },
        context
      );

      expect(shipmentRes3).to.not.equal(undefined);
      expect(shipmentRes3.status).to.equal("completed");
      expect(shipmentRes3.stages[0].status).to.equal("completed");
      expect(shipmentRes3.stages[0].dates.pickup?.arrival?.actual).to.eql(
        dateUpdate
      );
      expect(shipmentRes3.stages[0].dates.delivery?.arrival?.actual).to.eql(
        dateUpdate2
      );

      // check de-normalization !!this is not awaited for...
      const shipment = await Shipment.first(SHIPMENT_ID, {
        fields: { pickup: 1, delivery: 1 }
      });

      expect(shipment).to.not.equal(undefined);
      expect(shipment.pickup.dateActual).to.not.equal(
        undefined,
        "dateActual pickup"
      );
      expect(shipment.delivery.dateActual).to.not.equal(
        undefined,
        "dateActual delivery"
      );
    });
  });
  describe("[scheduleStage]", function() {
    const context = {
      accountId: ACCOUNT_ID,
      userId: USER_ID
    };
    beforeEach(async function() {
      await resetCollections(["shipments", "stages"]);
      return true;
    });
    it("throws an error when not logged in", async function() {
      let testError;
      try {
        await resolvers.Mutation.scheduleStage(null, { input: {} }, {});
      } catch (error) {
        testError = error;
      }
      expect(testError).to.be.an("error");
      expect(testError.message).to.match(/not-authorized/);
    });
    it("schedule stage", async function() {
      this.timeout(5000);

      const scheduledLoadingDate = new Date();
      const scheduledUnLoadingDate = new Date();
      const shipmentRes = await resolvers.Mutation.scheduleStage(
        null,
        {
          input: {
            stageId: STAGE_ID,
            loading: scheduledLoadingDate.getTime(),
            unloading: null
          }
        },
        context
      );

      // FIXME: return value has no scheduled dates in it - what is not waiting??
      expect(shipmentRes).to.not.equal(undefined);

      await resolvers.Mutation.scheduleStage(
        null,
        {
          input: {
            stageId: STAGE_ID,
            loading: scheduledLoadingDate.getTime(),
            unloading: scheduledUnLoadingDate.getTime()
          }
        },
        context
      );

      const stage = await Stage.first(STAGE_ID, { fields: { dates: 1 } });
      expect(stage.dates.pickup.arrival.scheduled).to.not.equal(undefined);
      expect(stage.dates.delivery.arrival.scheduled).to.not.equal(undefined);

      // check de-normalization !!this is not awaited for...
      // const shipment = await Shipment.first(SHIPMENT_ID, {
      //   fields: { pickup: 1, delivery: 1 }
      // });

      // expect(shipment).to.not.equal(undefined);
      // expect(shipment.pickup.dateScheduled).to.not.equal(undefined);
      // expect(shipment.delivery.dateScheduled).to.not.equal(undefined);
    });
  });
});
