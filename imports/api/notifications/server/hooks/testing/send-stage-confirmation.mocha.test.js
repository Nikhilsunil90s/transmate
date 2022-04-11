/* eslint-disable func-names */
import { expect } from "chai";
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";

import { sendStageConfirmationHook } from "/imports/api/notifications/server/hooks/shipment-stage-released-generateDoc";

const debug = require("debug")("email:send:stage-confirmation");

const ACCOUNT_ID = "";
const USER_ID = "";

let defaultMongo;

describe("stage confirmation", function() {
  before(async () => {
    debug("create mongo connections");
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../../.testing/mocha/DefaultMongo.js");
      await defaultMongo.connect();
    }

    debug("dynamic import of resetdb");
    await resetDb({ resetUsers: true });
  });
  it("sendStageConfirmationHook", async function() {
    let result;
    try {
      result = await sendStageConfirmationHook({
        shipmentId: "2jG2mZFcaFzqaThcr",
        stageId: "mTQmzoCfAiLbGFzo3",
        accountId: ACCOUNT_ID,
        userId: USER_ID
      });
    } catch (e) {
      // without cloud call we can only get this far
      result = e;
    }
    expect(result.message).to.equal(
      "Generate doc: No url in function response"
    );
  });
});
