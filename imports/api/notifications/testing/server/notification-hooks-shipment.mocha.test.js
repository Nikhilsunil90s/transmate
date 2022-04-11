/* eslint-disable no-underscore-dangle */
/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */
import sinon from "sinon";
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb";
import { JobManager } from "/imports/utils/server/job-manager.js";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection";

import { Shipment } from "/imports/api/shipments/Shipment";

// data
import { shipmentReferenceHook } from "../../server/hooks/shipment-reference-notification";
import { shipmentStageReleasedHook } from "../../server/hooks/shipment-stage-released";
import { shipmentCanceledHook } from "../../server/hooks/shipment-canceled-notification";
import { documentAddedHook } from "../../server/hooks/document-added-notification";
import { shipmentRequestHook } from "../../server/hooks/shipment-request";

import { User } from "/imports/api/users/User";
import { Notification } from "/imports/api/notifications/Notification";

const { expect } = require("chai");

// const { expect } = require("chai");

describe("notifications.hooks", function() {
  let defaultMongo;
  let spyFn;

  const ACCOUNT_ID = "S65957";
  const USER_ID = "jsBor6o3uRBTFoRQY";

  const CARRIER_USER_ID = "pYFLYFDMJEnKADY3h"; // playco
  const SHIPMENT_ID = "2jG2mZFcaFzqaThcr";
  const STAGE_ID = "mTQmzoCfAiLbGFzo3";
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo");
      await defaultMongo.connect();
    }

    const resetDone = await resetDb({ resetUsers: true });
    if (!resetDone) throw Error("reset was not possible, test can not run!");
  });
  before(async function() {
    spyFn = sinon.spy(JobManager, "post");
  });
  after(function() {
    spyFn.restore();
  });
  describe("shipment notifications", function() {
    // "./shipment-created"; -> no test needed (only activity recording)
    // "./shipment-canceled-notification"; -> ok
    // "./shipment-request"; -> ok
    // "./shipment-delayed-email"; -> not used anymore ?
    // "./shipment-delayed-notification"; -> not used anymore??
    // "./shipment-note-notification"; -> not used anymore??
    // "./shipment-received-notification"; -> not used anymore??
    // "./shipment-reference-notification"; -> ok
    // "./shipment-stage-released"; -> ok
    // "./shipment-stage-released-generateDoc"; -> covered in other test
    // "./stage-eta-email"; -> not used anymore??
    // "./stage-eta-flags";-> not used anymore??
    // "./stage-eta-notification";-> not used anymore??
    //  "./shipment-project-created"; -> no test needed (only activity recording)
    // "./document-added-update.js"; -> test ok
    beforeEach(async function() {
      await Notification._collection.remove({});
      return resetCollections(["shipments", "stages"]);
    });
    it("[shipment-request]shipment request submi tted", async function() {
      // shipment request has been created. The user clicks on submit
      await Shipment._collection.update(
        { _id: SHIPMENT_ID },
        {
          $set: {
            status: "draft",
            request: {
              requestedOn: new Date(),
              submittedOn: new Date(),
              by: "someUserserId",
              accountId: "someAccountId",
              status: "submitted"
            }
          }
        }
      );

      await shipmentRequestHook({
        shipmentId: SHIPMENT_ID,
        accountId: ACCOUNT_ID,
        userId: USER_ID
      });

      // test if the notification has been created:
      const notifications = await Notification.where({
        "data.shipmentId": SHIPMENT_ID
      });

      expect(notifications).to.be.an("array");
      expect(notifications).to.have.lengthOf(1);
      expect(notifications[0].event).to.equal("requested");
    });
    it("shipment reference update ", async function() {
      // shipment not in draft
      // user that is not the current user
      // user should have notification setting on
      // key == "shipment-reference-notification" >> shipment > updates
      await Shipment._collection.update(
        { _id: SHIPMENT_ID },
        { $set: { status: "planned" } }
      );

      // 1. update user preference:
      await User._collection.update(
        { _id: CARRIER_USER_ID },
        {
          $set: {
            "preferences.notifications": [
              {
                // key: "shipment-reference-notification",
                group: "shipments",
                subGroup: "updates",
                app: true,
                mail: true
              }
            ]
          }
        }
      );

      await shipmentReferenceHook({
        shipmentId: SHIPMENT_ID,
        reference: "carrier",
        userId: USER_ID
      });

      const notifications = await Notification.where({
        "data.shipmentId": SHIPMENT_ID
      });

      expect(notifications).to.have.lengthOf(2);
      expect(notifications[0].type).to.equal("shipment");
      expect(notifications.map(({ userId }) => userId)).to.include(
        CARRIER_USER_ID
      );
    });
    it("shipment canceled hook ", async function() {
      // user that is not the current user
      // user should have notification setting on
      // key == "shipment-canceled-notification" >> shipment > updates

      await User._collection.update(
        { _id: CARRIER_USER_ID },
        {
          $set: {
            "preferences.notifications": [
              {
                // key: "shipment-canceled-notification",
                group: "shipments",
                subGroup: "updates",
                app: true,
                mail: true
              }
            ]
          }
        }
      );

      await shipmentCanceledHook({
        shipmentId: SHIPMENT_ID,
        reference: "carrier",
        userId: USER_ID
      });

      const notifications = await Notification.where({
        "data.shipmentId": SHIPMENT_ID
      });

      expect(notifications).to.have.lengthOf(1);
      expect(notifications[0].type).to.equal("shipment");
      expect(notifications[0].userId).to.equal(CARRIER_USER_ID);
    });
    it("shipment stage released", async function() {
      // >triggers other notification
      await shipmentStageReleasedHook({
        shipmentId: SHIPMENT_ID,
        stageId: STAGE_ID,
        stageCount: 0
      });

      expect(spyFn.callCount).to.equal(1);
      expect(spyFn.getCall(0).lastArg).to.eql({
        priceListId: "Mo8X54TpZ8snqgR6Q",
        priceRequestId: "zgSR5RRWJoHMDSEDy",
        selectedBidderId: "C75701",
        shipmentId: "2jG2mZFcaFzqaThcr"
      });
    });
    it("document added hook", async function() {
      await Notification._collection.remove({});

      // user that is not the current user
      // user should have notification setting on
      // key ==  "shipment-reference-notification" >> shipment > updates

      await User._collection.update(
        { _id: CARRIER_USER_ID },
        {
          $set: {
            "preferences.notifications": [
              {
                // key:  "shipment-reference-notification",
                group: "shipments",
                subGroup: "updates",
                app: true,
                mail: true
              }
            ]
          }
        }
      );

      await documentAddedHook({
        document: {
          id: "test_id",
          shipmentId: SHIPMENT_ID,
          type: "some_type",
          meta: {
            type: "application/pdf",
            name: "stageConfirmation NYLSH.pdf",
            lastModifiedDate: new Date(),
            size: 32182
          }
        },
        userId: USER_ID
      });

      const notifications = await Notification.where({
        "data.shipmentId": SHIPMENT_ID
      });

      expect(notifications).to.have.lengthOf(2);
      expect(notifications[0].type).to.equal("document");
      expect(notifications.map(({ userId }) => userId)).to.include(
        CARRIER_USER_ID
      );
    });
  });
});
