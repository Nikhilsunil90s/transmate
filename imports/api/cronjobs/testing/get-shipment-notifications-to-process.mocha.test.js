/* eslint-disable func-names */
import { expect } from "chai";

import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { getShipmentsWithNotificationsToProcess } from "../get-notifications";
import { Shipment } from "/imports/api/shipments/Shipment";

const debug = require("debug")("shipment:notification:cron:test");

describe("shipment-notifications cron", function() {
  let defaultMongo;

  // const USER_ID = "jsBor6o3uRBTFoRQY";
  const SHIPMENT_ID = "2jG2mZFcaFzqaThYY";
  const CARRIER_ID = "C11051";
  const CARRIER_USER_ID = "pYFLYFDMJEnKADYXX";

  // const SHIPPER_ID = "S65957";

  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../.testing/mocha/DefaultMongo.js");
      await defaultMongo.connect();
    }

    debug("dynamic import of resetdb");
    await resetDb({
      resetUsers: true
    });
  });
  beforeEach(async () => {
    const now = new Date();
    const tomorrow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );
    const notifications = [
      {
        key: "shipment-alert-will-load",
        role: "carrier",
        accountId: CARRIER_ID,
        userId: CARRIER_USER_ID,
        sendAt: tomorrow,
        offSet: null,
        app: true,
        mail: true
      },
      {
        key: "shipment-alert-will-load",
        role: "carrier",
        accountId: CARRIER_ID,
        userId: CARRIER_USER_ID,
        sendAt: new Date(),

        offSet: null,
        app: true,
        mail: true
      },
      {
        key: "shipment-alert-will-load",
        role: "shipper",
        accountId: "someId",
        userId: "someUserId",
        sendAt: new Date("2017-10-18T22:00:00.000Z"),
        offSet: null,
        app: true,
        mail: true
      }
    ];
    await Shipment._collection.rawCollection().update(
      {
        _id: SHIPMENT_ID
      },
      {
        $set: {
          notifications,
          "updated.at": new Date("2017-10-18T22:00:00.000Z")
        }
      }
    );
  });
  it("get shipments", async function() {
    const { shipmentIds } = await getShipmentsWithNotificationsToProcess();
    debug("shipment ids %o", shipmentIds);
    expect(shipmentIds)
      .to.be.a("array")
      .to.eql([SHIPMENT_ID]);
  });
});
