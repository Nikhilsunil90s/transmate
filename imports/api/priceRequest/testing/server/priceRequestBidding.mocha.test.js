/* eslint-disable no-underscore-dangle */
/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */
import { expect } from "chai";
import sinon from "sinon";
import { JobManager } from "/imports/utils/server/job-manager.js";

// collections
import { PriceRequest } from "../../PriceRequest";
import { PriceList } from "/imports/api/pricelists/PriceList";
import { PriceListTemplate } from "/imports/api/priceListTemplates/PriceListTemplate";
import { PriceListRate } from "/imports/api/pricelists/PriceListRate";

import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection.js";
import { priceRequestBidService } from "/imports/api/priceRequest/services/priceRequestBid";
import { spotTemplateDataDB } from "/imports/api/priceListTemplates/testing/spotTemplateData";
import { priceListDoc as spotPriceListDoc } from "/imports/api/pricelists/testing/server/priceListSpotData.js";

// import { resolvers } from "../../apollo/resolvers";

const ACCOUNT_ID = "S65957";

// const USER_ID = "jsBor6o3uRBTFoRQY";
const PRICE_REQUEST_ID = "FYyFaceLqAeh5nnmo"; // has 1 bidding item

const CARRIER_ID = "C11051";
const CARRIER_USER_ID = "pYFLYFDMJEnKADYXX";
const CARRIER_ID2 = "C75701";

// const CARRIER_USER_ID2 = "pYFLYFDMJEnKADY3h";

let defaultMongo;
describe("PriceRequest", function() {
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo");
      await defaultMongo.connect();
    }

    const resetDone = await resetDb({ resetUsers: true });
    if (!resetDone) throw Error("reset was not possible, test can not run!");
  });
  describe("Bidding", function() {
    const carrierId = CARRIER_ID;
    const priceRequestId = PRICE_REQUEST_ID;
    let priceRequest;
    let spyFn;

    before(async function() {
      spyFn = sinon.spy(JobManager, "post");
      await PriceListTemplate._collection.insert(spotTemplateDataDB);
    });
    after(function() {
      spyFn.restore();
    });
    beforeEach(async function() {
      await PriceList._collection.remove({});
      await resetCollections(["priceRequests"]);
      await PriceRequest._collection.update(
        { _id: priceRequestId },
        {
          $set: {
            creatorId: ACCOUNT_ID,
            customerId: ACCOUNT_ID,
            status: "draft",
            bidders: [
              {
                accountId: CARRIER_ID2,
                name: "dummy"
              },
              { accountId: CARRIER_ID, name: "testing Bidder" }
            ]
          }
        }
      );
    });
    describe("service", function() {
      it("[service]allows a carrier to bid on a request with a generic template", async function() {
        // storyline:
        // carrier is in the price request and clicks on the bid button,
        // in the background a blanc price list is created (with reference to the priceRequest)
        // the bid entry in the price request gets the priceListId

        // price request exists & carrier account is in db
        priceRequest = await PriceRequest.first(priceRequestId);
        await priceRequest.push({ items: { shipmentId: "3BA7Z35yXv7HbpbXX" } });
        await priceRequest.reload();

        const srv = priceRequestBidService({
          priceRequest: PriceRequest.init(priceRequest),
          accountId: CARRIER_ID,
          userId: CARRIER_USER_ID
        }).getMyBid();
        await srv.check();
        srv.getTemplate({ type: "spot" });
        await srv.copyPriceListTemplate({ context: "bid" });
        await srv.linkBid();
        const newPriceListId = srv.get();

        // checks:
        // 1. priceList -> created with correct accountIds?
        const generatedPriceList = await PriceList.first(newPriceListId);
        expect(generatedPriceList.creatorId).to.equal(ACCOUNT_ID);
        expect(generatedPriceList.customerId).to.equal(ACCOUNT_ID);
        expect(generatedPriceList.carrierId).to.equal(CARRIER_ID);
        expect(generatedPriceList.status).to.equal("requested");

        // 2. priceList has the shipment Structure?
        expect(generatedPriceList.shipments).to.have.lengthOf(2);
        expect(generatedPriceList.shipments).to.eql(priceRequest.items);

        // 3. request has bids linked?
        const updatedRequest = await PriceRequest.first(priceRequest._id);

        expect(updatedRequest.bidders).to.have.lengthOf(
          2,
          "update may not affect the other bidders in array"
        );
        expect(updatedRequest.bidders[0].priceListId).to.equal(
          undefined,
          "update may not affect the other bidders in array"
        );

        const bidIndex = updatedRequest.bidders.findIndex(
          ({ accountId: bidderAcc }) => bidderAcc === carrierId
        );
        expect(updatedRequest.bidders[bidIndex].priceListId).to.equal(
          newPriceListId
        );

        expect(updatedRequest.bidders[bidIndex].bidOpened).to.be.instanceOf(
          Date
        );
      });
      it("[service][single item]allows a carrier to perform a quick bid", async function() {
        this.timeout(10000);

        // storyline:
        // carrier is in the price request and edits the quickbid form (only when 1 shipment is present),
        // in the background a price list is created (with reference to the priceRequest) with the entered data in it
        // the bid entry in the price request gets the priceListId

        priceRequest = await PriceRequest.first(priceRequestId);
        const [firstPriceRequestItem] = priceRequest.items;
        const { shipmentId } = firstPriceRequestItem;

        const chargeLines = [
          {
            chargeId: "test1",
            costId: "ie6wFKJAydFCj8ZLj",
            amount: { unit: "USD", value: 12 },
            name: "test charge 1",
            multiplier: "shipment"
          },
          {
            chargeId: "test2",
            costId: "ie6wFKJAydFCj8ZLj",
            name: "test charge 2",
            multiplier: "shipment",
            amount: { value: 10, unit: "EUR" }
          }
        ];

        const biddingService = priceRequestBidService({
          priceRequest,
          accountId: CARRIER_ID,
          userId: CARRIER_USER_ID
        }).getMyBid();
        await biddingService.check(); // async
        biddingService.getTemplate({ type: "spot" });

        await biddingService.copyPriceListTemplate({ context: "bid" });
        await biddingService.linkBid();

        // check if priceList has been generated:
        const newPriceListId = biddingService.get();
        expect(newPriceListId).to.not.equal(undefined);

        await biddingService.editSimpleBid({ chargeLines, shipmentId });

        // test the detail documents
        const rateCount = await PriceListRate.count({
          priceListId: newPriceListId
        });
        expect(rateCount).to.equal(2);

        await Promise.all(
          chargeLines.map(async chargeLine => {
            const doc = await PriceListRate.first({
              priceListId: newPriceListId,
              "rulesUI.chargeId": chargeLine.chargeId
            });
            expect(doc.amount).to.eql(chargeLine.amount);
            expect(doc.amount.unit).to.not.equal(undefined);
            expect(doc.rulesUI).to.eql({ chargeId: chargeLine.chargeId });
            expect(doc.rules).to.eql([{ shipmentId }]);
          })
        );

        await biddingService.releaseSimpleBid();
        const priceList = await PriceList.first(newPriceListId);
        expect(priceList).to.not.equal(undefined);
        expect(priceList.status).to.equal("for-approval");
        expect(priceList.charges).to.have.lengthOf(2);

        // the bid flag in priceRequest should be set to true
        const updatedPriceRequest = await PriceRequest.first(priceRequest._id, {
          fields: { bidders: { $elemMatch: { accountId: carrierId } } }
        });

        expect(updatedPriceRequest.bidders[0].accountId).to.equal(carrierId);

        expect(updatedPriceRequest.bidders[0].bid).to.equal(true);

        // check hooks that are called:
        // to do change to worker spy:  sinon.assert.calledWith(spyFn, "price-request.recalculate");
        sinon.assert.calledWith(spyFn, "price-request.bidReceived");

        const [, firstCallArgs] = spyFn.firstCall.args;
        expect(firstCallArgs.priceRequestId).to.equal(PRICE_REQUEST_ID);
        expect(firstCallArgs.userId).to.equal(CARRIER_USER_ID);
      });
      it("[service][single item]allows a carrier to perform an update on a quick bid", async function() {
        this.timeout(10000);

        // storyline:
        // carrier is in the price request and edits the quickbid form,
        // in the background a price list is updated (with reference to the priceRequest) with the entered data in it
        // the bid entry in the price request gets the priceListId

        priceRequest = await PriceRequest.first(priceRequestId);
        const [firstPriceRequestItem] = priceRequest.items;
        const { shipmentId } = firstPriceRequestItem;

        const chargeLines = [
          {
            chargeId: "test1",
            costId: "ie6wFKJAydFCj8ZLj",
            amount: { unit: "USD", value: 12 },
            name: "test charge 1",
            multiplier: "shipment"
          },
          {
            chargeId: "test2",
            costId: "ie6wFKJAydFCj8ZLj",
            name: "test charge 2",
            multiplier: "shipment",
            amount: { value: 10, unit: "EUR" }
          },
          {
            chargeId: "test3",
            costId: "ie6wFKJAydFCj8ZLj",
            name: "test charge 3",
            multiplier: "shipment",
            amount: { value: 20, unit: "EUR" }
          }
        ];

        // priceList in the db:
        const priceListDoc = { ...spotPriceListDoc, accountId: carrierId };
        const priceListId = priceListDoc._id;
        priceListDoc.shipments[0].shipmentId = shipmentId;

        await PriceList._collection.insert(priceListDoc);

        // prep as-if we have done a bid before:
        priceRequest.bidders[1].simpleBids = [
          {
            date: new Date("2020-06-17T11:09:36.253+02:00"),
            shipmentId,
            chargeLines: [
              {
                chargeId: "kvrTMnuzXcpMvACTg",
                name: "some existing chargeLine that will be overwritten",
                costId: "o6fLThAWhaWW3uDaj",
                amount: {
                  value: 106,
                  unit: "EUR"
                }
              }
            ]
          }
        ];
        priceRequest.bidders[1].priceListId = priceListId;

        const biddingService = priceRequestBidService({
          priceRequest: PriceRequest.init(priceRequest),
          accountId: CARRIER_ID,
          userId: CARRIER_USER_ID
        }).getMyBid();
        await biddingService.check(); // async
        expect(biddingService.hasLinkedPriceList).to.equal(
          true,
          "should have found the priceListId of the previous bid"
        );

        // update simpleBid:
        await biddingService.editSimpleBid({ chargeLines, shipmentId });

        // test the detail documents
        const rateCount = await PriceListRate.count({ priceListId });
        expect(rateCount).to.equal(3);

        await Promise.all(
          chargeLines.map(async chargeLine => {
            const doc = await PriceListRate.first({
              priceListId,
              "rulesUI.chargeId": chargeLine.chargeId
            });
            expect(doc.amount).to.eql(chargeLine.amount);
            expect(doc.amount.unit).to.not.equal(undefined);
            expect(doc.rulesUI).to.eql({ chargeId: chargeLine.chargeId });
            expect(doc.rules).to.eql([{ shipmentId }]);
          })
        );

        await biddingService.releaseSimpleBid();
      });
      it("[service][multi item]allows a carrier to perform a quick bid", async function() {
        this.timeout(10000);

        // storyline:
        // carrier is in the price request and edits the quickbid form (only when 1 shipment is present),
        // in the background a price list is created (with reference to the priceRequest) with the entered data in it
        // the bid entry in the price request gets the priceListId
        // assumes 2 items
        priceRequest = await PriceRequest.first(priceRequestId);
        await priceRequest.push({
          items: {
            shipmentId: "3BA7Z35yXv7HbpbXX",
            params: { from: {}, to: {} }
          }
        });
        await priceRequest.reload();

        const biddingService = priceRequestBidService({
          priceRequest: PriceRequest.init(priceRequest),
          accountId: CARRIER_ID,
          userId: CARRIER_USER_ID
        }).getMyBid();
        await biddingService.check();
        biddingService.getTemplate({ type: "spot" });
        await biddingService.copyPriceListTemplate({ context: "bid" });
        await biddingService.linkBid();

        // check if priceList has been generated:
        const newPriceListId = biddingService.get();
        expect(newPriceListId).to.not.equal(undefined);

        // push all shipments through:

        await Promise.all(
          priceRequest.items.map(async ({ shipmentId }) => {
            const chargeLines = [
              {
                chargeId: "test1",
                costId: "ie6wFKJAydFCj8ZLj",
                amount: { unit: "USD", value: 12 },
                name: "test charge 1",
                multiplier: "shipment"
              },
              {
                chargeId: "test2",
                costId: "ie6wFKJAydFCj8ZLj",
                name: "test charge 2",
                multiplier: "shipment",
                amount: { value: 10, unit: "EUR" }
              }
            ];

            const notes = "SOME_NOTES";

            await biddingService.editSimpleBid({
              chargeLines,
              shipmentId,
              notes
            });

            await Promise.all(
              chargeLines.map(async chargeLine => {
                const doc = await PriceListRate.first({
                  priceListId: newPriceListId,
                  "rulesUI.chargeId": chargeLine.chargeId,
                  "rules.shipmentId": shipmentId
                });
                expect(doc.amount).to.eql(chargeLine.amount);
                expect(doc.amount.unit).to.not.equal(undefined);
                expect(doc.rulesUI).to.eql({ chargeId: chargeLine.chargeId });
                expect(doc.rules).to.eql([{ shipmentId }]);
              })
            );
          })
        );

        // test the detail documents
        const rateCount = await PriceListRate.count({
          priceListId: newPriceListId
        });
        expect(rateCount).to.equal(4);

        await biddingService.releaseSimpleBid();
        const priceList = await PriceList.first(newPriceListId);
        expect(priceList).to.not.equal(undefined);
        expect(priceList.status).to.equal("for-approval");
        expect(priceList.charges).to.have.lengthOf(2);

        // the bid flag in priceRequest should be set to true
        const updatedPriceRequest = await PriceRequest.first(priceRequest._id, {
          fields: { bidders: { $elemMatch: { accountId: carrierId } } }
        });

        expect(updatedPriceRequest.bidders[0].accountId).to.equal(carrierId);

        expect(updatedPriceRequest.bidders[0].bid).to.equal(true);

        // check hooks that are called:
        // to do change to worker spy:  sinon.assert.calledWith(spyFn, "price-request.recalculate");
        sinon.assert.calledWith(spyFn, "price-request.bidReceived");

        const [, firstCallArgs] = spyFn.firstCall.args;
        expect(firstCallArgs.priceRequestId).to.equal(priceRequest._id);
        expect(firstCallArgs.userId).to.equal(CARRIER_USER_ID);
      });
      it("[service][multi item]allows a carrier to perform an update on a quick bid", async function() {
        this.timeout(10000);

        // storyline:
        // carrier is in the price request and edits the quickbid form,
        // in the background a price list is updated (with reference to the priceRequest) with the entered data in it
        // the bid entry in the price request gets the priceListId
        priceRequest = await PriceRequest.first(priceRequestId);
        await priceRequest.push({
          items: {
            shipmentId: "3BA7Z35yXv7HbpbXX",
            params: { from: {}, to: {} }
          }
        });
        await priceRequest.reload();

        // priceList in the db:
        const priceListDoc = { ...spotPriceListDoc, accountId: carrierId };
        const priceListId = priceListDoc._id;
        const firstItemShipmentId = priceRequest.items[0].shipmentId;
        priceListDoc.shipments[0].shipmentId = firstItemShipmentId;

        await PriceList._collection.insert(priceListDoc);

        // prep as-if we have done a bid before:
        priceRequest.bidders[1].simpleBids = [
          {
            date: new Date("2020-06-17T11:09:36.253+02:00"),
            shipmentId: firstItemShipmentId,
            chargeLines: [
              {
                chargeId: "kvrTMnuzXcpMvACTg",
                name: "some existing chargeLine that will be overwritten",
                costId: "o6fLThAWhaWW3uDaj",
                amount: {
                  value: 106,
                  unit: "EUR"
                }
              }
            ]
          }
        ];
        priceRequest.bidders[1].priceListId = priceListId;

        // to ensure test is in sync with consequent db calls,
        // we MUST also add the simpleBid to the db!!
        await PriceRequest._collection.update(
          { _id: priceRequest._id },
          {
            $set: {
              "bidders.1.simpleBids": priceRequest.bidders[1].simpleBids,
              "bidders.1.priceListId": priceListId
            }
          }
        );

        const biddingService = priceRequestBidService({
          priceRequest: PriceRequest.init(priceRequest),
          accountId: CARRIER_ID,
          userId: CARRIER_USER_ID
        }).getMyBid();
        await biddingService.check(); // this should see a priceListId exists
        expect(biddingService.hasLinkedPriceList).to.equal(
          true,
          "should have found the priceListId of the previous bid"
        );

        // update simpleBids:
        await Promise.all(
          priceRequest.items.map(async ({ shipmentId }) => {
            const chargeLines = [
              {
                chargeId: "test1",
                costId: "ie6wFKJAydFCj8ZLj",
                amount: { unit: "USD", value: 12 },
                name: "test charge 1",
                multiplier: "shipment"
              },
              {
                chargeId: "test2",
                costId: "ie6wFKJAydFCj8ZLj",
                name: "test charge 2",
                multiplier: "shipment",
                amount: { value: 10, unit: "EUR" }
              },
              {
                chargeId: "test3",
                costId: "ie6wFKJAydFCj8ZLj",
                name: "test charge 3",
                multiplier: "shipment",
                amount: { value: 20, unit: "EUR" }
              }
            ];
            await biddingService.editSimpleBid({ chargeLines, shipmentId });

            await Promise.all(
              chargeLines.map(async chargeLine => {
                const doc = await PriceListRate.first({
                  priceListId,
                  "rulesUI.chargeId": chargeLine.chargeId,
                  "rules.shipmentId": shipmentId
                });
                expect(doc.amount).to.eql(chargeLine.amount);
                expect(doc.amount.unit).to.not.equal(undefined);
                expect(doc.rulesUI).to.eql({ chargeId: chargeLine.chargeId });
                expect(doc.rules).to.eql([{ shipmentId }]);
              })
            );
          })
        );

        // test the detail documents
        const rateCount = await PriceListRate.count({ priceListId });
        expect(rateCount).to.equal(6);

        await biddingService.releaseSimpleBid();
      });
    });
  });
});
