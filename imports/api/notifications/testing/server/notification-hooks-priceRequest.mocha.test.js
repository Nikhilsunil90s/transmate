/* eslint-disable no-underscore-dangle */
/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */
import { expect } from "chai";
import moment from "moment";
import get from "lodash.get";
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection";
import { getPriceRequestAccountsData } from "/imports/api/notifications/server/hooks/functions/get-price-request-accounts-data";
import { AllAccounts } from "../../../allAccounts/AllAccounts";

import { accountTestData } from "/imports/api/allAccounts/testing/server/accountTestData";
import { PriceRequest } from "/imports/api/priceRequest/PriceRequest";
import { PriceList } from "/imports/api/pricelists/PriceList";
import { Shipment } from "/imports/api/shipments/Shipment";
import { Stage } from "/imports/api/stages/Stage";
// eslint-disable-next-line import/no-namespace

import { priceRequestTestData } from "./notificationPriceRequestTestData";
import { getPartnerContacts } from "/imports/api/notifications/server/hooks/functions/get-partner-contacts";
import { generateStageData } from "/imports/api/stages/testing/server/stageTestData";

// data
import { shipmentDoc as oceanShipmentDoc } from "/imports/api/shipments/testing/server/shipmentOceanData";
import { shipmentDoc as roadShipmentDoc } from "/imports/api/shipments/testing/server/shipmentRoadData";

import { setStatusPriceRequestBidder } from "../../server/hooks/functions/updateBidderStatus";
import { priceRequestDraftHook } from "/imports/api/notifications/server/hooks/price-request-draft";
import { priceRequestRequestedHook } from "/imports/api/notifications/server/hooks/price-request-requested";
import { priceRequestCancelledHook } from "/imports/api/notifications/server/hooks/price-request-cancelled";
import {
  priceRequestSelectedHook,
  PRICE_REQUEST_FIELDS as fieldsForSelectedHook
} from "/imports/api/notifications/server/hooks/price-request-selected";
import { priceRequestExpiredHook } from "/imports/api/notifications/server/hooks/price-request-expired";
import { priceRequestbidReceivedHook } from "/imports/api/notifications/server/hooks/price-request-bidReceived";
import { priceRequestModifiedHook } from "/imports/api/notifications/server/hooks/price-request-modified";
import { sendStageConfirmationHook } from "/imports/api/notifications/server/hooks/shipment-stage-released-generateDoc";
import { DocTemplate } from "/imports/api/templates/Template";
import { User } from "/imports/api/users/User";
import { Task } from "/imports/api/bpmn-tasks/Task";
import { Notification } from "/imports/api/notifications/Notification";

const debug = require("debug")("notifications:tests");

describe("notifications.hooks", function() {
  let defaultMongo;
  const ACCOUNT_ID = "S65957";
  const USER_ID = "jsBor6o3uRBTFoRQY";

  const CARRIER_ID = "C75701"; // playco
  const CARRIER_USER_ID = "pYFLYFDMJEnKADY3h"; // playco
  const CARRIER_ID2 = "C11051";
  const SHIPMENT_ID1 = roadShipmentDoc._id;
  let PRICE_REQUEST_ID;
  let PRICE_LIST_ID;
  let STAGE_ID;
  const SHIPMENT_ID2 = oceanShipmentDoc._id;

  function resetBidderNotificationStatus(partnerIds = []) {
    return Promise.all(
      partnerIds.map(bidderId =>
        setStatusPriceRequestBidder({
          priceRequestId: PRICE_REQUEST_ID,
          bidderId,
          set: [],
          unset: ["notified", "won", "bid", "lost", "bidOpened", "viewed"]
        })
      )
    );
  }

  before(async () => {
    process.env.MOCK_generateDoc = true;
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo");
      await defaultMongo.connect();
    }

    const resetDone = await resetDb({ resetUsers: true });
    if (!resetDone) throw Error("reset was not possible, test can not run!");
  });

  let prExample;
  let priceListDoc;

  before(async function() {
    debug("set price request obj");
    ({ priceRequestDoc: prExample, priceListDoc } = priceRequestTestData({
      accountId: ACCOUNT_ID,
      creatorUserId: USER_ID,
      carrierUserId: CARRIER_USER_ID,
      shipmentId1: SHIPMENT_ID1,
      shipmentId2: SHIPMENT_ID2,
      carrierId1: CARRIER_ID,
      carrierId2: CARRIER_ID2
    }));

    PRICE_REQUEST_ID = prExample._id;
    PRICE_LIST_ID = priceListDoc._id;

    [STAGE_ID] = roadShipmentDoc.stageIds;

    return Promise.all([
      Shipment._collection.insert({
        ...roadShipmentDoc,
        carrierIds: [CARRIER_ID]
      }),
      Shipment._collection.insert(oceanShipmentDoc),
      Stage._collection.insert({
        ...generateStageData({ carrierId: CARRIER_ID }),
        _id: STAGE_ID,
        carrierId: CARRIER_ID,
        shipmentId: SHIPMENT_ID1
      })
    ]);
  });

  after(function() {
    process.env.MOCK_generateDoc = undefined;
  });

  describe("price-request notifications", function() {
    // "./price-request-created";
    // "./price-request-draft"; -> test ok
    // "./price-request-requested"; -> test ok
    // "./price-request-cancelled"; -> test ok
    // "./price-request-selected"; -> test ok
    // "./price-request-bidReceived"; -> test ok
    // "./price-request-modified"; -> tesk ok
    // "./price-request-expired"; -> test ok
    beforeEach(async function() {
      await resetCollections(["accounts", "users"]);
      await Promise.all([
        PriceRequest._collection.remove({}),
        PriceList._collection.remove({})
      ]);

      return Promise.all([
        PriceRequest._collection.insert(prExample),
        PriceList._collection.insert(priceListDoc, {
          bypassCollection2: true
        }),
        ...[
          [CARRIER_ID, true],
          [CARRIER_ID2, false]
        ].map(([carrierId, addUserContact]) =>
          AllAccounts._collection.update(carrierId, {
            $set: {
              accounts: [
                { accountId: "someOtherId" },
                {
                  accountId: ACCOUNT_ID,
                  profile: {
                    ...accountTestData.profileData(),
                    contacts: [
                      ...(addUserContact
                        ? [
                            {
                              contactType: "sales",
                              mail: "newCarrierContact@transmate.eu",
                              phone: "0490588790"
                            }
                          ]
                        : [])
                    ]
                  }
                }
              ]
            }
          })
        )
      ]);
    });
    it("getPartnerContacts with existing user", async function() {
      const contacts = await getPartnerContacts({
        accountId: ACCOUNT_ID,
        partnerId: CARRIER_ID,
        users: [CARRIER_USER_ID]
      });
      expect(contacts.users.length).to.equal(1, "should be only one user");
      expect(contacts.users[0]._id).to.equal(CARRIER_USER_ID);
    });

    it("getPartnerContacts with new user", async function() {
      const contacts = await getPartnerContacts({
        accountId: ACCOUNT_ID,
        partnerId: CARRIER_ID,
        users: []
      });
      expect(contacts.users.length).to.equal(1, "should be only one user");
      debug("new user %o", contacts.users[0]);
      expect(get(contacts, "users[0].emails.0.address")).to.equal(
        "newCarrierContact@transmate.eu"
      );
    });

    it("getPartnerContacts with new user, but it has an linkedId now", async function() {
      const contacts = await getPartnerContacts({
        accountId: ACCOUNT_ID,
        partnerId: CARRIER_ID,
        users: []
      });
      expect(contacts.users.length).to.equal(1, "should be only one user");
      debug("new user %o", contacts.users[0]);
      expect(get(contacts, "users[0].emails.0.address")).to.equal(
        "newCarrierContact@transmate.eu"
      );
    });

    it("getPriceRequestAccountsData", async function() {
      const priceRequestObj = {
        customerId: ACCOUNT_ID,
        bidders: [
          {
            accountId: CARRIER_ID,
            name: "24/7 design",
            viewed: true,
            notified: new Date()
          }
        ]
      };
      const result = await getPriceRequestAccountsData(priceRequestObj);

      // check if enrich data worked, we should have _id fields on both
      debug("getPriceRequestAccountsData %o", result);
      expect(get(result, "bidders[0].id")).to.equal(CARRIER_ID);
      expect(get(result, "bidders[0].viewed")).to.equal(true);
      expect(get(result, "bidders[0].notified")).to.equal(
        get(priceRequestObj, "bidders[0].notified")
      );
      expect(get(result, "customer._id")).to.equal(ACCOUNT_ID);
    });

    it("request draft hook", async function() {
      // eslint-disable-next-line import/no-named-as-default-member
      const priceRequest = await PriceRequest.first(PRICE_REQUEST_ID);
      const logging = await priceRequestDraftHook(priceRequest);

      // should send 1 mail to bob , to suspend (archived state)
      expect(get(logging, "bidders")).to.equal(2);

      expect(get(logging, "mails")).to.equal(1);
      const resultPr = await PriceRequest.first(PRICE_REQUEST_ID);
      expect(get(resultPr, "bidders[1].notified")).to.equal(undefined);
    });

    it("request requested hook", async function() {
      // make sure the notification flag is off in the price request document for the accounts:
      await resetBidderNotificationStatus([CARRIER_ID, CARRIER_ID2]);
      const priceRequest = await PriceRequest.first(PRICE_REQUEST_ID);

      const logging = await priceRequestRequestedHook(priceRequest);

      // should send 1 mail to bob
      expect(get(logging, "bidders")).to.equal(2);

      // in example carrier is already notified
      expect(get(logging, "mails")).to.equal(1);

      const resultPr = await PriceRequest.first(PRICE_REQUEST_ID);
      debug("pr %o for id %s", resultPr, PRICE_REQUEST_ID);
      expect(get(resultPr, "bidders[1].notified")).to.be.an("date");
    });

    it("requested hook + contact without id", async function() {
      // eslint-disable-next-line import/no-named-as-default-member
      const priceRequest = await PriceRequest.first(PRICE_REQUEST_ID);

      // remove notified flag
      priceRequest.bidders[1].notified = undefined;
      priceRequest.bidders[1].userIds = [];
      const logging = await priceRequestRequestedHook(priceRequest);

      // should send 1 mail to jan
      expect(get(logging, "bidders")).to.equal(2);

      // in example carrier is already notified
      expect(get(logging, "mails")).to.equal(1);
      const resultPr = await PriceRequest.first(PRICE_REQUEST_ID);
      debug("pr %o for id %s", resultPr, PRICE_REQUEST_ID);
      expect(get(resultPr, "bidders[1].notified")).to.be.an("date");
    });

    it("cancelled hook (cancel all carriers)", async function() {
      // eslint-disable-next-line import/no-named-as-default-member
      const priceRequest = await PriceRequest.first(PRICE_REQUEST_ID);
      const logging = await priceRequestCancelledHook(priceRequest);

      // should send 1 mail to bob
      expect(get(logging, "bidders")).to.equal(2);
      expect(get(logging, "mails")).to.equal(1);
      const resultPr = await PriceRequest.first(PRICE_REQUEST_ID);
      expect(get(resultPr, "bidders[1].notified")).to.equal(undefined);
    });

    it("request select hook", async function() {
      // triggered when releasing stage
      // notification is emitted with price request, selectedBidderId, and shipmentId
      await resetBidderNotificationStatus([CARRIER_ID, CARRIER_ID2]);

      // prepare data: - bidder has a simpleBid entries
      await PriceRequest._collection.update(
        { _id: PRICE_REQUEST_ID },
        {
          $unset: { "bidders.1.won": 1 },
          $set: {
            "bidders.1.simpleBids": [
              {
                date: new Date("2020-09-01T08:27:28.128+02:00"),
                shipmentId: SHIPMENT_ID1,
                chargeLines: [
                  {
                    chargeId: "kvrTMnuzXcpMvACTg",
                    name: "Base rate",
                    costId: "o6fLThAWhaWW3uDaj",
                    amount: {
                      value: 1190,
                      unit: "EUR"
                    },
                    comment: null
                  }
                ]
              },
              {
                date: new Date("2020-09-01T08:28:22.116+02:00"),
                shipmentId: SHIPMENT_ID2,
                chargeLines: [
                  {
                    chargeId: "kvrTMnuzXcpMvACTg",
                    name: "Base rate",
                    costId: "o6fLThAWhaWW3uDaj",
                    amount: {
                      value: 1325,
                      unit: "EUR"
                    },
                    comment: null
                  }
                ]
              }
            ]
          }
        }
      );

      // confirm shipments & test
      // first shipmentId 1 is allocated >> PR status remains in requested
      // then second shipmentid is allocated >> PR status should be allocated

      let logging;
      let itemIndex;
      let expectedStatus;
      const priceRequest = await PriceRequest.first(PRICE_REQUEST_ID, {
        fields: fieldsForSelectedHook
      });

      // first bid: idx 0, status: requested
      itemIndex = 0;
      expectedStatus = "requested";
      logging = await priceRequestSelectedHook({
        priceRequest,
        selectedBidderId: CARRIER_ID,
        selectedPriceListId: PRICE_LIST_ID,
        shipmentId: SHIPMENT_ID1
      });

      // should send 1 mail to bob
      expect(get(logging, "bidders")).to.equal(2);
      expect(get(logging, "mails")).to.equal(1);
      expect(get(logging, "errors")).to.have.lengthOf(0);
      await priceRequest.reload();
      expect(get(priceRequest, "bidders[1].won")).to.be.a("date");

      // on simpleBid
      expect(
        get(priceRequest, ["bidders", 1, "simpleBids", itemIndex, "won"])
      ).to.be.a("date");
      expect(
        get(priceRequest, ["bidders", 1, "simpleBids", itemIndex, "queueMail"])
      ).to.be.a("date");
      expect(
        get(priceRequest, ["items", itemIndex, "allocation", "accountId"])
      ).to.equal(CARRIER_ID);
      expect(
        get(priceRequest, ["items", itemIndex, "allocation", "date"])
      ).to.be.a("date");

      // check the price request status:
      expect(get(priceRequest, "status")).to.equal(expectedStatus);

      // second one:
      itemIndex = 1;
      expectedStatus = "archived";
      logging = await priceRequestSelectedHook({
        priceRequest,
        selectedBidderId: CARRIER_ID,
        selectedPriceListId: PRICE_LIST_ID,
        shipmentId: SHIPMENT_ID2
      });

      // should send 1 mail to bob
      expect(get(logging, "bidders")).to.equal(2);
      expect(get(logging, "mails")).to.equal(1);
      expect(get(logging, "errors")).to.have.lengthOf(0);
      await priceRequest.reload();
      expect(get(priceRequest, "bidders[1].won")).to.be.a("date");

      // on simpleBid
      expect(
        get(priceRequest, ["bidders", 1, "simpleBids", itemIndex, "won"])
      ).to.be.a("date");
      expect(
        get(priceRequest, ["bidders", 1, "simpleBids", itemIndex, "queueMail"])
      ).to.be.a("date");
      expect(
        get(priceRequest, ["items", itemIndex, "allocation", "accountId"])
      ).to.equal(CARRIER_ID);
      expect(
        get(priceRequest, ["items", itemIndex, "allocation", "date"])
      ).to.be.a("date");

      // check the price request status:
      expect(get(priceRequest, "status")).to.equal(expectedStatus);

      // test price list document:
      const resultPL = await PriceList.first(PRICE_LIST_ID, {
        fields: { status: 1 }
      });
      expect(resultPL.status).to.equal("active");
    });

    it("request select hook - declined all", async function() {
      // triggered when releasing stage
      // notification is emitted with price request, selectedBidderId, and shipmentId
      await resetBidderNotificationStatus([CARRIER_ID, CARRIER_ID2]);

      // prepare data: - bidder has a simpleBid entries
      await PriceRequest._collection.update(
        { _id: PRICE_REQUEST_ID },
        {
          $unset: { "bidders.1.won": 1 },
          $set: {
            "bidders.1.simpleBids": [
              {
                date: new Date("2020-09-01T08:27:28.128+02:00"),
                shipmentId: SHIPMENT_ID1,
                chargeLines: [
                  {
                    chargeId: "kvrTMnuzXcpMvACTg",
                    name: "Base rate",
                    costId: "o6fLThAWhaWW3uDaj",
                    amount: {
                      value: 1190,
                      unit: "EUR"
                    },
                    comment: null
                  }
                ]
              },
              {
                date: new Date("2020-09-01T08:28:22.116+02:00"),
                shipmentId: SHIPMENT_ID2,
                chargeLines: [
                  {
                    chargeId: "kvrTMnuzXcpMvACTg",
                    name: "Base rate",
                    costId: "o6fLThAWhaWW3uDaj",
                    amount: {
                      value: 1325,
                      unit: "EUR"
                    },
                    comment: null
                  }
                ]
              }
            ]
          }
        }
      );

      // confirm shipments & test
      // first shipmentId 1 is allocated >> PR status remains in requested
      // then second shipmentid is allocated >> PR status should be allocated

      let logging;
      let itemIndex;
      let expectedStatus;
      const priceRequest = await PriceRequest.first(PRICE_REQUEST_ID, {
        fields: fieldsForSelectedHook
      });

      // first bid: idx 0, status: requested
      itemIndex = 0;
      expectedStatus = "requested";
      logging = await priceRequestSelectedHook({
        priceRequest,
        selectedBidderId: CARRIER_ID2,
        selectedPriceListId: "SOME_OTHER_ID",
        shipmentId: SHIPMENT_ID1
      });

      // should send 1 mail to bob
      expect(get(logging, "bidders")).to.equal(2);
      expect(get(logging, "mails")).to.equal(1);
      expect(get(logging, "errors")).to.have.lengthOf(0);
      await priceRequest.reload();
      expect(get(priceRequest, "bidders[1].won")).to.equal(undefined);

      // on simpleBid
      expect(
        get(priceRequest, ["bidders", 1, "simpleBids", itemIndex, "won"])
      ).to.equal(undefined);
      expect(
        get(priceRequest, ["bidders", 1, "simpleBids", itemIndex, "queueMail"])
      ).to.be.a("date");
      expect(
        get(priceRequest, ["items", itemIndex, "allocation", "accountId"])
      ).to.equal(CARRIER_ID2);
      expect(
        get(priceRequest, ["items", itemIndex, "allocation", "date"])
      ).to.be.a("date");

      // check the price request status:
      expect(get(priceRequest, "status")).to.equal(expectedStatus);

      // second one:
      itemIndex = 1;
      expectedStatus = "archived";
      logging = await priceRequestSelectedHook({
        priceRequest,
        selectedBidderId: CARRIER_ID2,
        selectedPriceListId: "SOME_OTHER_ID",
        shipmentId: SHIPMENT_ID2
      });

      // should send 1 mail to bob
      expect(get(logging, "bidders")).to.equal(2);
      expect(get(logging, "mails")).to.equal(1);
      expect(get(logging, "errors")).to.have.lengthOf(0);
      await priceRequest.reload();
      expect(get(priceRequest, "bidders[1].won")).to.equal(undefined);

      // on simpleBid
      expect(
        get(priceRequest, ["bidders", 1, "simpleBids", itemIndex, "won"])
      ).to.equal(undefined);
      expect(
        get(priceRequest, ["bidders", 1, "simpleBids", itemIndex, "queueMail"])
      ).to.be.a("date");
      expect(
        get(priceRequest, ["items", itemIndex, "allocation", "accountId"])
      ).to.equal(CARRIER_ID2);
      expect(
        get(priceRequest, ["items", itemIndex, "allocation", "date"])
      ).to.be.a("date");

      // check the price request status:
      expect(get(priceRequest, "status")).to.equal(expectedStatus);

      // test price list document:
      const resultPL = await PriceList.first(PRICE_LIST_ID, {
        fields: { status: 1 }
      });
      expect(resultPL.status).to.equal("declined");
    });

    it("request expired hook", async function() {
      // eslint-disable-next-line import/no-named-as-default-member
      const priceRequest = await PriceRequest.first(PRICE_REQUEST_ID);
      expect(priceRequest).to.be.an("object");

      // update due date to past date (5 min ago)
      await PriceRequest._collection.update(
        { _id: priceRequest._id },
        { $set: { dueDate: new Date(Date.now() - 5 * 1000 * 60) } }
      );
      expect(priceRequest._id).to.be.an("string");
      const logging = await priceRequestExpiredHook(priceRequest._id);

      // should send 1 mail to owner
      expect(get(logging, "mails")).to.equal(1);
    });

    it("request bidReceived hook", async function() {
      // pre-requirements: Task should have been created (this happens on releasing the PR)
      const taskDoc = await Task.first({});
      await taskDoc.update_async({
        "references.id": PRICE_REQUEST_ID,
        userParams: {
          userIds: [CARRIER_USER_ID],
          dueDate: moment()
            .add(1, "day")
            .toDate()
        }
      });

      await priceRequestbidReceivedHook({
        priceRequestId: PRICE_REQUEST_ID,
        userId: CARRIER_USER_ID,
        priceList: { _id: "someId", carrierId: CARRIER_ID },
        statusChange: true // he has set the pricelist to "for-approval"
      });

      await taskDoc.reload();
      expect(taskDoc.finished).to.equal(true);
      expect(taskDoc.updates).to.have.lengthOf(1);
    });

    it("request modified hook", async function() {
      await Notification._collection.remove({});
      await priceRequestModifiedHook({ priceRequestId: PRICE_REQUEST_ID });
      const notifications = await Notification.where({
        "data.priceRequestId": PRICE_REQUEST_ID
      });
      expect(notifications).to.have.lengthOf(3);
      expect(notifications.map(({ userId }) => userId)).to.include(
        CARRIER_USER_ID
      );
      expect(notifications[0].data.priceRequestId).to.equal(PRICE_REQUEST_ID);
    });

    // FIXME: need to find a solution to avoid generating documents and sending emails >> can we sub this?
    it.skip("stage release -> stageConfirmation email", async function() {
      debug("fix return call cloud");
      this.timeout(10000);

      process.env.CLOUD_RETURN_OBJ = JSON.stringify({
        html: Buffer.from("test", "utf8").toString("base64"),
        url:
          "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        size: 1
      });

      await Promise.all([
        DocTemplate._collection.insert({
          name: "stageConfirmation",
          template: "{{shipment._id}}"
        }),
        DocTemplate._collection.insert({
          name: "stageConfirmationMail",
          template: "{{shipment._id}}"
        })
      ]);

      // set delivery note flag
      // 1 get user by email address:
      await User._collection.update(
        { _id: CARRIER_USER_ID },
        {
          $set: {
            "preferences.notifications": [
              {
                // key: "shipment-stage-released-generateDoc",
                group: "shipments",
                subGroup: "documents",
                app: false,
                mail: true
              }
            ]
          }
        }
      );

      const logging = await sendStageConfirmationHook({
        shipmentId: SHIPMENT_ID1,
        stageId: STAGE_ID,
        accountId: ACCOUNT_ID,
        userId: USER_ID
      });

      debug("stageConfirmation %o", logging);
      expect(get(logging, "mailCount")).to.equal(2);
      expect(get(logging, "message")).to.equal("test");
    });

    it("check if numidia price confirm works", function() {
      // to do
    });
  });
});
