/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
import { Meteor } from "meteor/meteor";
import { expect } from "chai";
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";

import { User } from "/imports/api/users/User";
import { Shipment } from "/imports/api/shipments/Shipment";
import { setShipmentNotificationFlags } from "../setShipmentNotificationFlags";

const debug = require("debug")("shipment:notification:test");

const USER_ID = "jsBor6o3uRBTFoRQY";
const SHIPMENT_ID = "2jG2mZFcaFzqaThYY";
const CARRIER_ID = "C11051";
const CARRIER_USER_ID = "pYFLYFDMJEnKADYXX";
const SHIPPER_ID = "S65957";

describe("shipment-notifications flags", function() {
  let defaultMongo;
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo");
      await defaultMongo.connect();
    }

    const resetDone = await resetDb({ resetUsers: true }); // will add data
    if (!resetDone) throw Error("reset was not possible, test can not run!");
    Meteor.setUserId && Meteor.setUserId(USER_ID);
  });
  describe("set", function() {
    it("sets after shipment creation", async function() {
      const shipmentId = SHIPMENT_ID;
      await Shipment._collection.update(
        { _id: shipmentId },
        { $unset: { notifications: 1 } }
      );
      await setShipmentNotificationFlags({ shipmentId }).setAfterCreation();

      // test:
      const shipment = await Shipment.first(shipmentId, {
        fields: { notifications: 1 }
      });

      expect(shipment.notifications).to.not.equal(undefined);
      expect(shipment.notifications).to.have.lengthOf(1);
      expect(shipment.notifications[0].key).to.equal(
        "shipment-alert-will-load"
      );
    });
    it("sets after carrier allocation", async function() {
      const shipmentId = SHIPMENT_ID;
      await Shipment._collection.update(
        { _id: shipmentId },
        { $unset: { notifications: 1 }, $set: { carrierIds: [CARRIER_ID] } }
      );

      await User._collection.update(
        { _id: CARRIER_USER_ID },
        {
          $set: {
            "preferences.notifications": [
              {
                group: "shipments",
                subGroup: "shipment-fillout-alert",
                mail: false,
                app: true,
                offSet: 100
              }
            ]
          }
        }
      );

      await setShipmentNotificationFlags({
        shipmentId
      }).setAfterCarrierAssignment(CARRIER_ID);

      const shipment = await Shipment.first(shipmentId, {
        fields: { notifications: 1 }
      });
      debug("shipment setAfterCarrierAssignment %o", shipment);
      expect(shipment.notifications).to.not.equal(undefined);
      expect(shipment.notifications).to.have.lengthOf(2);
      expect(shipment.notifications[0].key).to.equal(
        "shipment-alert-will-load"
      );
      expect(shipment.notifications[1].key).to.equal("shipment-alert-fillout");
      expect(shipment.notifications[1].app).to.equal(true);
      expect(shipment.notifications[1].mail).to.equal(false);
      expect(shipment.notifications[1].offSet).to.equal(100);
    });
    it("sets after partner allocation", async function() {
      const shipmentId = SHIPMENT_ID;
      await Shipment._collection.update(
        { _id: shipmentId },
        {
          $unset: { notifications: 1 },
          $set: { accountId: "S12345" } // we change accountId as it does a check for doubles
        }
      );
      await setShipmentNotificationFlags({
        shipmentId
      }).setAfterPartnerUpdate(SHIPPER_ID, "shipper");

      const shipment = await Shipment.first(shipmentId, {
        fields: { notifications: 1 }
      });
      expect(shipment.notifications).to.not.equal(undefined);
      expect(shipment.notifications).to.have.lengthOf(1);
      expect(shipment.notifications[0].key).to.equal(
        "shipment-alert-will-load"
      );
      expect(shipment.notifications[0].role).to.equal("shipper");
    });
    it("removes notifications on account change", async function() {
      const shipmentId = SHIPMENT_ID;
      await Shipment._collection.update(
        { _id: shipmentId },
        {
          $set: {
            notifications: [
              {
                key: "shipment-alert-will-load",
                role: "carrier",
                accountId: CARRIER_ID,
                userId: CARRIER_USER_ID,
                sendAt: new Date("2017-10-18T22:00:00.000Z"),
                offSet: null,
                app: true,
                mail: true
              },
              {
                key: "shipment-alert-will-load",
                role: "carrier",
                accountId: CARRIER_ID,
                userId: CARRIER_USER_ID,
                sendAt: new Date("2017-10-18T22:00:00.000Z"),
                sent: new Date(),
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
            ]
          }
        }
      );

      await setShipmentNotificationFlags({
        shipmentId
      }).removeNotificationsForAccounts([CARRIER_ID]);

      const shipment = await Shipment.first(shipmentId, {
        fields: { notifications: 1 }
      });
      expect(shipment.notifications).to.not.equal(undefined);
      expect(shipment.notifications).to.have.lengthOf(2);
    });
    it("updates after date change", async function() {
      const shipmentId = SHIPMENT_ID;
      const newDate = new Date();
      await Shipment._collection.update(
        { _id: shipmentId },
        {
          $set: {
            "pickup.datePlanned": newDate,
            notifications: [
              {
                key: "shipment-alert-will-load",
                role: "carrier",
                accountId: CARRIER_ID,
                userId: CARRIER_USER_ID,
                sendAt: new Date("2017-10-18T22:00:00.000Z"),
                offSet: null,
                app: true,
                mail: true
              },
              {
                key: "shipment-alert-will-load",
                role: "carrier",
                accountId: CARRIER_ID,
                userId: CARRIER_USER_ID,
                sendAt: new Date("2017-10-18T22:00:00.000Z"),
                sent: new Date(),
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
                offSet: 2000,
                app: true,
                mail: true
              }
            ]
          }
        }
      );

      await setShipmentNotificationFlags({
        shipmentId
      }).updateAfterShipmentChange();

      const shipment = await Shipment.first(shipmentId, {
        fields: { notifications: 1 }
      });

      expect(shipment.notifications).to.not.equal(undefined);
      expect(shipment.notifications).to.have.lengthOf(3);
      expect(shipment.notifications[0].sendAt.getFullYear()).to.equal(
        newDate.getFullYear()
      );
      expect(shipment.notifications[1].sendAt.getFullYear()).to.equal(2017); // not modified
      expect(shipment.notifications[0].sendAt.getFullYear()).to.equal(
        newDate.getFullYear()
      );
    });
  });
  describe("get", function() {
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
      await Shipment._collection.update(
        {
          _id: SHIPMENT_ID
        },
        {
          $set: {
            notifications
          }
        }
      );
    });

    it("get notification, no valid id", async function() {
      const result = await await setShipmentNotificationFlags({
        shipmentId: "testId"
      }).getAndFlag();
      debug("notifications", result.toNotify);
      expect(result).to.be.a("array");
      expect(result.length).to.be.equal(0);
    });
    it("get notification", async function() {
      const result = await setShipmentNotificationFlags({
        shipmentId: SHIPMENT_ID
      }).getAndFlag();

      debug("notifications", result);
      expect(result).to.be.a("array");
      expect(result.length).to.be.equal(2);
    });

    it("get notifications second time", async function() {
      await setShipmentNotificationFlags({
        shipmentId: SHIPMENT_ID
      }).getAndFlag();
      const result = await setShipmentNotificationFlags({
        shipmentId: SHIPMENT_ID
      }).getAndFlag();
      debug("notifications %o", result.toNotify);
      expect(result).to.be.a("array");
      expect(result.length).to.be.equal(0);
    });
    it("send notifications", async function() {
      // will return an array of promisses
      const result = await Promise.all(
        await setShipmentNotificationFlags({
          shipmentId: SHIPMENT_ID
        }).processNotifications()
      );

      debug("send notifications result %o", result);
      expect(result).to.be.a("array");
      debug(result[0]);
      expect(result.find(el => el.userId).userId).to.be.oneOf([
        CARRIER_USER_ID,
        "someUserId"
      ]);
    });
  });
});
