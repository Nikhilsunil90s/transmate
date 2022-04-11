/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
import { Meteor } from "meteor/meteor";
import { Random } from "/imports/utils/functions/random.js";
import moment from "moment";

// import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection";
import { expect } from "chai";
import { resolvers } from "../../apollo/resolvers";
import { TenderBidData } from "/imports/api/tender-bids-data/TenderBidData";
import { PriceList } from "/imports/api/pricelists/PriceList";

// const debug = require("debug")("tenderify:test");

const ACCOUNT_ID = "S65957";
const USER_ID = "jsBor6o3uRBTFoRQY";

const TENDER_BID_ID = "ekLwjhFL2haYJpjXw";
const TENDER_BID_ID2 = "GnxFJFZfYyFdMTT9K";

let defaultMongo;
describe("tenderify", function() {
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo");
      await defaultMongo.connect();
    }

    const resetDone = await resetCollections([
      "users",
      "roles",
      "roleAssingments",
      "tenderBid",
      "tenderBidMapping",
      "tenderBidData",
      "tenderBidMeta"
    ]);
    if (!resetDone) throw Error("reset was not possible, test can not run!");
    Meteor.setUserId && Meteor.setUserId(USER_ID);
  });
  describe("resolvers", function() {
    const context = { accountId: ACCOUNT_ID, userId: USER_ID };
    beforeEach(async function() {
      const resetDone = await resetCollections([
        "tenderBid",
        "tenderBidMapping",
        "tenderBidData",
        "tenderBidMeta"
      ]);
      return resetDone;
    });
    it("[createTenderBid] allows to create a tender bid", async function() {
      const args = {};
      const res = await resolvers.Mutation.createTenderBid(null, args, context);
      expect(res).to.not.equal(undefined);
      expect(res.status).to.equal("open");
      expect(res.contacts[0].userId).to.equal(context.userId);
      expect(res.contacts[0].role).to.equal("owner");
    });
    it("[updateTenderBid] allows to update a tender bid", async function() {
      const args = {
        input: {
          tenderBidId: TENDER_BID_ID,
          updates: {
            name: "NEW NAME",
            tender: {
              receivedDate: moment()
                .subtract(1, "day")
                .toDate(),
              dueDate: moment()
                .add(1, "day")
                .toDate(),
              currentRound: 1,
              totalRounds: 1,
              volume: 15000,
              volumeUOM: "kg",
              revenue: { value: 15000000, unit: "EUR" }
            }
          }
        }
      };
      const res = await resolvers.Mutation.updateTenderBid(null, args, context);
      expect(res).to.not.equal(undefined);
      expect(res.name).to.equal(args.input.updates.name);
      expect(res.tender.volume).to.equal(args.input.updates.tender.volume);
    });
    it("[tenderBidGenerateOfferSheet] allows to generate offer", async function() {
      // this would call a cloud function that does an update in the database
      const args = {
        tenderBidId: TENDER_BID_ID
      };
      const res = await resolvers.Mutation.tenderBidGenerateOfferSheet(
        null,
        args,
        context
      );

      expect(res).to.not.equal(undefined);
      expect(res.offer.latest.version).to.equal(7);
      expect(res.offer.history).to.have.lengthOf(6);

      // FUTURE enhancement could be that we set the worker (subscription managed) key in the doc and then get the update once ready
    });
    it("[tenderBidAddDocument] allows to add a source document", async function() {
      const args = {
        input: {
          tenderBidId: TENDER_BID_ID2,
          document: {
            id: Random.id(),
            meta: {
              type:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              size: 81450,
              name: "wqYau.xlsx",
              lastModifiedDate: "2021-11-09T18:17:34.664Z"
            },
            store: {
              service: "s3",
              bucket: "files.transmate.eu",
              key: "documents/tenderify/TRafBKoDguNSic6PS/nQWDj"
            }
          }
        }
      };
      const res = await resolvers.Mutation.tenderBidAddDocument(
        null,
        args,
        context
      );

      expect(res).to.not.equal(undefined);
      expect(res.source.documents).to.be.an("array");
      expect(res.source.documents[1].id).to.equal(args.input.document.id);
    });
    it("[tenderBidRemoveDocument] allows to remove a source document", async function() {
      const args = {
        input: {
          tenderBidId: TENDER_BID_ID2,
          documentId: "PyuwR"
        }
      };
      const res = await resolvers.Mutation.tenderBidRemoveDocument(
        null,
        args,
        context
      );

      expect(res).to.not.equal(undefined);
      expect(res.source.documents).to.be.an("array");
      expect(res.source.documents).to.have.lengthOf(0);
    });
    it("[tenderBidAutoSelectPricelists] selects active rate cards based on destination", async function() {
      // preparation: we set the destination country to spain as we have rate cards for that:
      await TenderBidData._collection.update(
        { tenderBidId: TENDER_BID_ID2 },
        { $set: { "lanesToCountry.mapping": "ES" } },
        { multi: true }
      );
      await PriceList._collection.update(
        {},
        {
          $set: {
            creatorId: ACCOUNT_ID,
            customerId: ACCOUNT_ID
          }
        },
        { multi: true }
      );

      const args = { tenderBidId: TENDER_BID_ID2 };
      const res = await resolvers.Mutation.tenderBidAutoSelectPricelists(
        null,
        args,
        context
      );

      expect(res).to.not.equal(undefined);
      expect(res.settings.priceListIds).to.be.an("array");
      expect(res.settings.priceListIds).to.have.lengthOf(3);
    });
    it("[updateTenderBid] edit settings", async function() {
      const args = {
        input: {
          tenderBidId: TENDER_BID_ID2,
          updates: {
            settings: { priceListIds: ["testId1"] }
          }
        }
      };
      const updatedTenderBid = await resolvers.Mutation.updateTenderBid(
        null,
        args,
        context
      );

      expect(updatedTenderBid).to.not.equal(undefined);
      expect(updatedTenderBid.settings.priceListIds).to.be.an("array");
      expect(updatedTenderBid.settings.priceListIds).to.have.lengthOf(1);
    });
  });
});
