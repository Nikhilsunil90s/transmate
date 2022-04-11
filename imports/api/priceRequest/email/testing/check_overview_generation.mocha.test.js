/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
import { expect } from "chai";
import {
  getPrOverview,
  removeQueueFlag
} from "/imports/api/priceRequest/email/price-request-overview.js";
import { findPriceRequestsToProcessMails } from "/imports/api/cronjobs/price-request-sendUpdates.js";
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { priceRequestBidService } from "/imports/api/priceRequest/services/priceRequestBid";
import { PriceRequest } from "/imports/api/priceRequest/PriceRequest";

const debug = require("debug")("price-request:overview:test");

let defaultMongo;

const ACCOUNT_ID = "C75701";
const USER_ID = "pYFLYFDMJEnKADY3h";

const ACCOUNT_ID2 = "C11051";

// const USER_ID2 = "pYFLYFDMJEnKADYXX";

const PRICE_REQUEST_ID_1 = "sJfPKhnTYjdnXHPHK";
const PRICE_REQUEST_ID_2 = "zgSR5RRWJoHMDSEDy";
const SHIPMENT_ID1 = "Liy2zt3cqqymTKtfj";
const SHIPMENT_ID2 = "47J4rkTHYjkqhZDXe";
const BASE_URL = `${process.env.ROOT_URL || "http://localhost:3000"}`.replace(
  /\/$/,
  ""
);

describe("email:pr overview", function() {
  before(async () => {
    debug("create mongo connections");
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo.js");
      await defaultMongo.connect();
    }
    debug("dynamic import of resetdb");
    await resetDb({ resetUsers: true });
  });
  it("create overview lost", async function() {
    const priceRequest = await PriceRequest.first(PRICE_REQUEST_ID_1);
    const prOverview = await getPrOverview({
      priceRequest,
      bidderAccountId: ACCOUNT_ID
    });
    debug("overview %j", prOverview);
    expect(prOverview).to.be.an("object");
    expect(prOverview.overview[1]).to.eql({
      shipmentId: SHIPMENT_ID1,
      reference: undefined,
      shipmentLink: `${BASE_URL}/shipment/${SHIPMENT_ID1}`,
      kg: 12000,
      from: "DE",
      to: "DE",
      type: "not offered",
      ts: "0d"
    });
  });
  it("create overview 2", async function() {
    const shipmentId = "2jG2mZFcaFzqaThcr";

    const priceRequest = await PriceRequest.first(PRICE_REQUEST_ID_2);
    const prOverview = await getPrOverview({
      priceRequest,
      bidderAccountId: ACCOUNT_ID
    });
    debug("overview %j", prOverview);
    expect(prOverview).to.be.an("object");
    expect(prOverview.overview[0]).to.eql({
      shipmentId,
      reference: undefined,
      shipmentLink: `${BASE_URL}/shipment/${shipmentId}`,
      kg: undefined,
      from: "BH",
      to: "BE",
      type: "not offered",
      ts: "0d"
    });
  });

  it("create overview won", async function() {
    const priceRequest = await PriceRequest.first(PRICE_REQUEST_ID_1);
    const prOverview = await getPrOverview({
      priceRequest,
      bidderAccountId: ACCOUNT_ID2
    });
    debug("overview won %j", prOverview);
    expect(prOverview).to.be.an("object");
    expect(prOverview.overview[0].type).to.eql("won");
  });

  it("check model obj ", async function() {
    let pr = await PriceRequest.first(PRICE_REQUEST_ID_1);
    debug("pr first %o", pr.__is_new);
    expect(pr.__is_new).to.equal(false);
    pr = await PriceRequest.where(PRICE_REQUEST_ID_1);
    debug("pr where %o", pr[0].__is_new);
    expect(pr[0].__is_new).to.equal(false);
  });

  it("remove flags", async function() {
    const pr = await removeQueueFlag(PRICE_REQUEST_ID_1);
    debug("pr after flag removal %o", pr);
    expect(pr).to.equal(true);
  });

  it("set flag won  with service (no bidding done for this shipment)", async function() {
    let priceRequest = await PriceRequest.first(PRICE_REQUEST_ID_1);
    await priceRequestBidService({
      priceRequest,
      accountId: ACCOUNT_ID,
      userId: USER_ID
    })
      .getMyBid()
      .setWinLost({ shipmentId: SHIPMENT_ID1, isWinner: true });

    // check if change is done
    priceRequest = await PriceRequest.first(PRICE_REQUEST_ID_1);
    debug("pr after flag set %o", priceRequest._id);
    const bidderObj = priceRequest.bidders.find(
      el => el.accountId === ACCOUNT_ID
    );
    debug("simpleBids after flag set won  %o", bidderObj.simpleBids);
    expect(bidderObj.simpleBids).to.be.an("array");
    const bid = bidderObj.simpleBids.find(el => el.shipmentId === SHIPMENT_ID1);

    expect(bid).to.equal(undefined);
  });

  it("set flag lost with service (no bidding done for this shipment)", async function() {
    let priceRequest = await PriceRequest.first(PRICE_REQUEST_ID_1);
    await priceRequestBidService({
      priceRequest,
      accountId: ACCOUNT_ID,
      userId: USER_ID
    })
      .getMyBid()
      .setWinLost({ shipmentId: SHIPMENT_ID1, isWinner: false });

    // check if change is done
    priceRequest = await PriceRequest.first(PRICE_REQUEST_ID_1);
    debug("pr after flag set %o", priceRequest._id);
    const bidderObj = priceRequest.bidders.find(
      el => el.accountId === ACCOUNT_ID
    );
    debug("simpleBids after flag set lost %o", bidderObj.simpleBids);
    expect(bidderObj.simpleBids).to.be.an("array");
    const bid = bidderObj.simpleBids.find(el => el.shipmentId === SHIPMENT_ID1);
    expect(bid).to.equal(undefined);
  });

  it("check cron function", async function() {
    this.timeout(10000);
    debug("set flag on first bidder/simplebid");

    const priceRequest = await PriceRequest.first(PRICE_REQUEST_ID_1);
    await priceRequestBidService({
      priceRequest,
      accountId: ACCOUNT_ID,
      userId: USER_ID
    })
      .getMyBid()
      .setWinLost({ shipmentId: SHIPMENT_ID2, isWinner: false });

    const pr = await findPriceRequestsToProcessMails();
    debug("pr after flag removal %o", pr);
    expect(pr.log).to.be.an("array");
    debug("result logArray %o", pr);
    expect(pr.log[1]).to.equal(
      `process :${PRICE_REQUEST_ID_1}`,
      `data in log :${JSON.stringify(pr.log)}`
    );
    expect(pr.results).to.be.an("array");
    debug("result mailResults %o", pr.results[0].mailResults);
    const mail = await pr.results[0].mailResults[0].sendClass.buildAndSend();
    expect(mail.ok).to.equal(true);

    // second time this should give 0
    const pr2 = await findPriceRequestsToProcessMails();
    debug("pr after flag removal %o", pr2);
    expect(pr2.log).to.be.an("array");
    expect(pr2.log[0]).to.eql("prs to process :0");
  });
});
