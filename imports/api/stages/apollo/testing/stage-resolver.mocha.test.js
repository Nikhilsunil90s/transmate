/* eslint-disable func-names */
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection";
import { resolvers } from "/imports/api/stages/apollo/resolvers.js";
import { expect } from "chai";

const debug = require("debug")("shipment:getShipmentNumber:test");

const ACCOUNT_ID = "S65957";
const USER_ID = "jsBor6o3uRBTFoRQY";

// const SHIPMENT_ID = "2jG2mZFcaFzqaThcr";
const STAGE_ID = "mTQmzoCfAiLbGFzo3";
const root = undefined;

let defaultMongo;
describe("stage resolver", function() {
  before(async () => {
    debug("create mongo connections");
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo.js");
      await defaultMongo.connect();
    }
    debug("dynamic import of resetdb");
    const resetDone = await resetDb({ resetUsers: true });
    if (!resetDone) throw Error("reset was not possible, test can not run!");
  });
  beforeEach(function() {
    return resetCollections(["shipments", "stages"]);
  });

  it("release and confirm date", async function() {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(16, 0, 0, 0);
    const dates = {
      pickupArrival: today

      // deliveryArrival: tomorrow
    };
    const context = { accountId: ACCOUNT_ID, userId: USER_ID };
    const argsSetStatus = { stageId: STAGE_ID, status: "release" };
    await resolvers.Mutation.setStageStatus(root, argsSetStatus, context);
    const argsConfirmStage = {
      input: { stageId: STAGE_ID, dates }
    };
    const result = await resolvers.Mutation.confirmStage(
      root,
      argsConfirmStage,
      context
    );
    debug("confirmstage result %j", result);
    expect(result).to.be.an("object");
    expect(result.stages[0].dates.pickup.arrival.actual).to.eql(today);
  });

  it("release and confirm dates -> pickup actual start loading", async function() {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(16, 0, 0, 0);
    const dates = {
      pickupStart: today

      // deliveryArrival: tomorrow
    };
    const context = { accountId: ACCOUNT_ID, userId: USER_ID };
    const argsSetStatus = { stageId: STAGE_ID, status: "release" };
    await resolvers.Mutation.setStageStatus(root, argsSetStatus, context);

    const argsConfirmStage = {
      input: { stageId: STAGE_ID, dates }
    };
    const result = await resolvers.Mutation.confirmStage(
      root,
      argsConfirmStage,
      context
    );
    debug("confirmstage result %j", result);
    expect(result).to.be.an("object");
    expect(result.stages[0].dates.pickup.start.actual).to.eql(today);
  });

  it("release and confirm dates -> delivery: actual start loading", async function() {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(16, 0, 0, 0);
    const dates = {
      deliveryStart: today

      // deliveryArrival: tomorrow
    };
    const context = { accountId: ACCOUNT_ID, userId: USER_ID };
    const argsSetStatus = { stageId: STAGE_ID, status: "release" };
    await resolvers.Mutation.setStageStatus(root, argsSetStatus, context);

    const argsConfirmStage = {
      input: { stageId: STAGE_ID, dates }
    };
    const result = await resolvers.Mutation.confirmStage(
      root,
      argsConfirmStage,
      context
    );
    debug("confirmstage result %j", result);
    expect(result).to.be.an("object");
    expect(result.stages[0].dates.delivery.start.actual).to.eql(today);
  });

  it("[throws] release and confirm date without dates", async function() {
    this.timeout(10000);
    const dates = {};
    const context = { accountId: ACCOUNT_ID, userId: USER_ID };
    const argsSetStatus = { stageId: STAGE_ID, status: "release" };
    await resolvers.Mutation.setStageStatus(root, argsSetStatus, context);
    const argsConfirmStage = {
      input: { stageId: STAGE_ID, dates }
    };
    let result;
    try {
      result = await resolvers.Mutation.confirmStage(
        root,
        argsConfirmStage,
        context
      );
    } catch (e) {
      result = e;
    }
    debug("confirmstage result %j", result);
    expect(result).to.be.an("error");
    expect(result.message).to.equal("no dates given in confirmStage");
  });
});
