/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
import get from "lodash.get";
import { Meteor } from "meteor/meteor";
import { Random } from "/imports/utils/functions/random.js";
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection";
import { expect } from "chai";
import { resolvers } from "../../apollo/resolvers";

import { Tender } from "/imports/api/tenders/Tender";
import { PriceList } from "/imports/api/pricelists/PriceList";

import { CheckTenderSecurity } from "/imports/utils/security/checkUserPermissionsForTender";

const debug = require("debug")("tenders:test");

const OWNER_ACCOUNT_ID = "S65957";
const TENDER_OWNER_ID = "jsBor6o3uRBTFoRQY";
const USER_ID = TENDER_OWNER_ID;
const TENDER_ID = "zx43GEoqXk66umzNS";
const BIDDER_ACCOUNT_ID = "C75701";
const BIDDER_USER_ID = "ojWEu2JwuvZJcAZip";
const PRICE_LIST_ID = "n8pYLq3LEzZDHqYS4";

const printError = checks => JSON.stringify(checks);

let defaultMongo;
describe("tender", function() {
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo");
      await defaultMongo.connect();
    }

    const resetDone = await resetDb({ resetUsers: true });
    if (!resetDone) throw Error("reset was not possible, test can not run!");
    Meteor.setUserId && Meteor.setUserId(USER_ID);
  });
  describe("security", function() {
    const context = {
      userId: USER_ID,
      accountId: OWNER_ACCOUNT_ID
    };
    const bidderContext = {
      userId: BIDDER_USER_ID,
      accountId: BIDDER_ACCOUNT_ID
    };

    let tender;
    before(async function() {
      tender = await Tender.first(TENDER_ID);
    });
    it("allows the owner / admin to view the dashboard [viewDashboard]", function() {
      const { checks, allowed } = new CheckTenderSecurity(
        {
          tender
        },
        context
      )
        .setContext({ ...context, roles: [] })
        .init()
        .can({ action: "viewDashboard" });

      expect(allowed).to.equal(true, printError(checks));
    });
    it("allows the owner / admin to edit general info [editGeneral]", function() {
      const { checks, allowed } = new CheckTenderSecurity(
        {
          tender
        },
        context
      )
        .setContext({ ...context, roles: [] })
        .init()
        .can({
          action: "editGeneral"
        });
      expect(allowed).to.equal(true, printError(checks));
    });
    it("allows the owner / admin to edit contacts [editContacts]", function() {
      const { checks, allowed } = new CheckTenderSecurity(
        {
          tender: { ...tender, status: "draft" }
        },
        context
      )
        .setContext({ ...context, roles: [] })
        .init()
        .can({
          action: "editContacts"
        });
      expect(allowed).to.equal(true, printError(checks));
    });
    it("allows the owner / admin to edit the introduction when status is draft [editIntroduction]", function() {
      const { checks, allowed } = new CheckTenderSecurity(
        {
          tender: { ...tender, status: "draft" }
        },
        context
      )
        .setContext({ ...context, roles: [] })
        .init()
        .can({
          action: "editIntroduction"
        });
      expect(allowed).to.equal(true, printError(checks));
    });
    it("allows the owner / admin to edit the requirements when status is draft [editRequirement]", function() {
      const { checks, allowed } = new CheckTenderSecurity(
        {
          tender: {
            ...tender,
            status: "draft"
          }
        },
        context
      )
        .setContext({ ...context, roles: [] })
        .init()
        .can({
          action: "editRequirement"
        });
      expect(allowed).to.equal(true, printError(checks));
    });
    it("allows the owner / admin to edit the FAQ when status is draft or open [editTenderFaq]", function() {
      const { checks, allowed } = new CheckTenderSecurity(
        {
          tender: {
            ...tender,
            status: "open"
          }
        },
        context
      )
        .setContext({ ...context, roles: [] })
        .init()
        .can({
          action: "editTenderFaq"
        });
      expect(allowed).to.equal(true, printError(checks));
    });
    it("allows the owner / admin to edit the scope when status is draft [editScope]", function() {
      const { checks, allowed } = new CheckTenderSecurity(
        {
          tender: { ...tender, status: "draft" }
        },
        context
      )
        .setContext({ ...context, roles: [] })
        .init()
        .can({
          action: "editScope"
        });
      expect(allowed).to.equal(true, printError(checks));
    });
    it("allows the owner / admin to edit data when status is draft [editData]", function() {
      const { checks, allowed } = new CheckTenderSecurity(
        {
          tender: { ...tender, status: "draft" }
        },
        context
      )
        .setContext({ ...context, roles: [] })
        .init()
        .can({
          action: "editData"
        });
      expect(allowed).to.equal(true, printError(checks));
    });
    it("allows the owner / admin to edit the profile when status is draft [editProfile]", function() {
      const { checks, allowed } = new CheckTenderSecurity(
        {
          tender: { ...tender, status: "draft" }
        },
        context
      )
        .setContext({ ...context, roles: [] })
        .init()
        .can({
          action: "editProfile"
        });
      expect(allowed).to.equal(true, printError(checks));
    });
    it("allows the owner / admin to edit partners when status is draft [editPartners]", function() {
      const { checks, allowed } = new CheckTenderSecurity(
        {
          tender: { ...tender, status: "open" }
        },
        context
      )
        .setContext({ ...context, roles: [] })
        .init()
        .can({
          action: "editPartners"
        });
      expect(allowed).to.equal(true, printError(checks));
    });
    it("allows the owner / admin to modify settings when status is draft [modifyTenderSettings]", function() {
      const { checks, allowed } = new CheckTenderSecurity(
        {
          tender: { ...tender, status: "draft" }
        },
        context
      )
        .setContext({ ...context, roles: [] })
        .init()
        .can({
          action: "modifyTenderSettings"
        });
      expect(allowed).to.equal(true, printError(checks));
    });
    it("allows the bidder to place bid [placeBid]", function() {
      // no NDA required"
      const tenderMod = {
        ...tender,
        status: "open"
      };

      tenderMod.bidders.push({
        accountId: bidderContext.accountId,
        userIds: [bidderContext.userId],
        NDAresponse: {
          accepted: true,
          doc: { id: "test", name: "test" },
          ts: { by: bidderContext.userId, at: new Date() }
        }
      });
      tenderMod.params.NDA.required = false;
      const { checks, allowed } = new CheckTenderSecurity(
        {
          tender: tenderMod
        },
        bidderContext
      )
        .setContext({ ...bidderContext, roles: [] })
        .init()
        .can({
          action: "placeBid"
        });
      expect(allowed).to.equal(true, printError(checks));
    });
    it("allows the bidder to place bid [placeBid] with NDA", function() {
      // no NDA required"
      const tenderMod = {
        ...tender,
        status: "open"
      };

      tenderMod.bidders.push({
        accountId: bidderContext.accountId,
        userIds: [bidderContext.userId],
        NDAresponse: {
          accepted: true,
          doc: { id: "test", name: "test" },
          ts: { by: bidderContext.userId, at: new Date() }
        }
      });

      // NDA is required"
      tenderMod.params.NDA.required = true;

      const { checks, allowed } = new CheckTenderSecurity(
        {
          tender: tenderMod
        },
        bidderContext
      )
        .setContext({ ...bidderContext, roles: [] })
        .init()
        .can({
          action: "placeBid"
        });
      expect(allowed).to.equal(true, printError(checks));
    });

    // actions / buttons:
    it("allows to release the tender if I am owner & has bidders", function() {
      const tDoc = { ...tender };

      tDoc.status = "draft";
      const { checks, allowed } = new CheckTenderSecurity(
        {
          tender: tDoc
        },
        context
      )
        .setContext({ ...context, roles: [] })
        .init()
        .can({ action: "canRelease" });

      expect(allowed).to.equal(true, printError(checks));
    });
    it("denies to release the tender if I am not owner", function() {
      const tDoc = { ...tender };
      tDoc.status = "draft";
      const { checks, allowed } = new CheckTenderSecurity(
        {
          tender: tDoc
        },
        bidderContext
      )
        .setContext({ ...bidderContext, roles: [] })
        .init()
        .can({ action: "canRelease" });
      expect(allowed).to.equal(false, printError(checks));
    });
    it("denies to release the tender if I am owner & no bidders", function() {
      const tDoc = { ...tender };
      tDoc.status = "draft";
      delete tDoc.bidders;
      const { checks, allowed } = new CheckTenderSecurity(
        {
          tender: tDoc
        },
        context
      )
        .setContext({ ...context, roles: [] })
        .init()
        .can({
          action: "canRelease"
        });

      expect(allowed).to.equal(false, printError(checks));
    });
    it("allows to put the tender to draft if I am owner", function() {
      const tDoc = { ...tender };
      tDoc.status = "open";
      const { checks, allowed } = new CheckTenderSecurity(
        {
          tender: tDoc
        },
        context
      )
        .setContext({ ...context, roles: [] })
        .init()
        .can({
          action: "canSetBackToDraft"
        });
      expect(allowed).to.equal(true, printError(checks));
    });
    it("denies to put the tender to draft if I am not owner", function() {
      const tDoc = { ...tender };
      tDoc.status = "open";
      const { checks, allowed } = new CheckTenderSecurity(
        {
          tender: tDoc
        },
        bidderContext
      )
        .setContext({ ...bidderContext, roles: [] })
        .init()
        .can({
          action: "canSetBackToDraft"
        });
      expect(allowed).to.equal(false, printError(checks));
    });
    it("allows to put the tender to review if I am owner", function() {
      const tDoc = { ...tender };
      tDoc.status = "open";
      const { checks, allowed } = new CheckTenderSecurity(
        {
          tender: tDoc
        },
        context
      )
        .setContext({ ...context, roles: [] })
        .init()
        .can({
          action: "canSetToReview"
        });
      expect(allowed).to.equal(true, printError(checks));
    });
    it("denies to put the tender to review if I am not owner", function() {
      const tDoc = { ...tender };
      tDoc.status = "open";
      const { checks, allowed } = new CheckTenderSecurity(
        {
          tender: tDoc
        },
        bidderContext
      )
        .setContext({ ...bidderContext, roles: [] })
        .init()
        .can({
          action: "canSetToReview"
        });
      expect(allowed).to.equal(false, printError(checks));
    });
    it("allows to put the tender to closed if I am owner", function() {
      const tDoc = { ...tender };
      tDoc.status = "review";
      const { checks, allowed } = new CheckTenderSecurity(
        {
          tender: tDoc
        },
        context
      )
        .setContext({ ...context, roles: [] })
        .init()
        .can({
          action: "canBeClosed"
        });
      expect(allowed).to.equal(true, printError(checks));
    });
    it("denies to put the tender to closed if I am owner", function() {
      const tDoc = { ...tender };
      tDoc.status = "review";
      const { checks, allowed } = new CheckTenderSecurity(
        {
          tender: tDoc
        },
        bidderContext
      )
        .setContext({ ...bidderContext, roles: [] })
        .init()
        .can({
          action: "canBeClosed"
        });
      expect(allowed).to.equal(false, printError(checks));
    });
    it("allows tocancel the tender if I am owner", function() {
      const tDoc = { ...tender };
      tDoc.status = "draft";
      const { checks, allowed } = new CheckTenderSecurity(
        {
          tender: tDoc
        },
        context
      )
        .setContext({ ...context, roles: [] })
        .init()
        .can({
          action: "canBeCanceled"
        });
      expect(allowed).to.equal(true, printError(checks));
    });
    it("denies tocancel the tender if I am owner", function() {
      const tDoc = { ...tender };
      tDoc.status = "draft";
      const { checks, allowed } = new CheckTenderSecurity(
        {
          tender: tDoc
        },
        bidderContext
      )
        .setContext({ ...bidderContext, roles: [] })
        .init()
        .can({
          action: "canBeCanceled"
        });
      expect(allowed).to.equal(false, printError(checks));
    });
    it("denies to cancel the tender if I owner and in wrong status", function() {
      const tDoc = { ...tender };
      tDoc.status = "open";
      const { checks, allowed } = new CheckTenderSecurity(
        {
          tender: tDoc
        },
        context
      )
        .setContext({ ...context, roles: [] })
        .init()
        .can({
          action: "canBeCanceled"
        });
      expect(allowed).to.equal(false, printError(checks));
    });
  });
  describe("bidding", function() {
    const tenderId = TENDER_ID;
    let tender;
    beforeEach(async function() {
      await resetCollections(["tenders"]);
      await Tender._collection.update(
        { _id: TENDER_ID },
        {
          $set: {
            status: "open",
            accountId: OWNER_ACCOUNT_ID,
            "contacts.0.userId": TENDER_OWNER_ID
          },
          $push: {
            bidders: {
              accountId: BIDDER_ACCOUNT_ID,
              userIds: [BIDDER_USER_ID]
            }
          }
        }
      );

      tender = await Tender.first(TENDER_ID);
    });
    describe("collecting bidder input", function() {
      const context = {
        userId: BIDDER_USER_ID,
        accountId: BIDDER_ACCOUNT_ID
      };
      it("stores bidder requirements inputs", async function() {
        const input = {
          tenderId,
          topic: "requirements",
          update: [
            {
              id: "ybQhKW",
              responseBool: true
            },
            {
              id: "299SQN",
              responseBool: true
            }
          ]
        };
        await resolvers.Mutation.tenderUpdateBid(null, { input }, context);

        const testDoc = await Tender.first({ _id: tenderId });

        expect(testDoc.bidders[1].requirements).to.eql(input.update);
      });
      it("stores bidder NDA inputs", async function() {
        const input = {
          tenderId,
          topic: "NDAresponse",
          update: {
            accepted: true,
            doc: {
              name: "NDA for Invacare 2019 transport tender - Rangel PT.pdf",
              id: "psvqfYiQqMdeEigme"
            }
          }
        };
        await resolvers.Mutation.tenderUpdateBid(null, { input }, context);

        const testDoc = await Tender.first({ _id: tenderId });
        expect(testDoc.bidders[1].NDAresponse).to.eql(input.update);
      });
      it("stores bidder documents inputs", async function() {
        const input = {
          tenderId,
          topic: "documents",
          update: [
            {
              id: Random.id(),
              name: "TEST NAME"
            }
          ]
        };
        await resolvers.Mutation.tenderUpdateBid(null, { input }, context);

        const testDoc = await Tender.first({ _id: tenderId });
        expect(testDoc.bidders[1].documents).to.eql(input.update);

        // do some negative testing if others are not changed!!
        expect(testDoc.bidders[0].documents).to.equal(undefined);
      });
      it("[tender.setTimeStamp] sets the timeStamp for a bidder", async function() {
        await resolvers.Mutation.setBidderTimeStamp(
          null,
          { tenderId },
          context
        );

        // checks:
        const testDoc = await Tender.first({ _id: tender._id });

        const bidderEntry = testDoc.bidders.find(
          ({ accountId }) => accountId === BIDDER_ACCOUNT_ID
        );
        expect(bidderEntry.firstSeen).to.not.equal(undefined);
        expect(bidderEntry.firstSeen).to.be.an.instanceOf(Date);
        expect(bidderEntry.lastSeen).to.not.equal(undefined);
        expect(bidderEntry.lastSeen).to.be.an.instanceOf(Date);
      });
    });
    describe("bidding with fixed price list", function() {
      beforeEach(async function() {
        // price List should be added & params.priceList should be linked:
        // update tender params
        await Tender._collection.update(
          { _id: tenderId },
          {
            $set: {
              "params.bid": {
                type: "priceList",
                priceListId: PRICE_LIST_ID,
                types: ["priceList", "file"]
              },
              "bidders.1.priceLists": []
            }
          }
        );
      });
      it("copies the priceList to bidder", async function() {
        const res = await resolvers.Mutation.tenderBidFixedPriceList(
          null,
          { tenderId: tender._id },
          {
            userId: BIDDER_USER_ID,
            accountId: BIDDER_ACCOUNT_ID
          }
        );

        const newPriceListId = res.priceListId;

        const testDoc = await Tender.first({ _id: tender._id });
        expect(testDoc.bidders[1].priceLists[0]).to.be.an("object");
        expect(testDoc.bidders[1].priceLists[0].id).to.equal(newPriceListId);
        expect(testDoc.bidders[1].priceLists).to.have.lengthOf(1);

        // do some negative testing if others are not changed!!
        expect(testDoc.bidders[0].priceLists).to.equal(undefined);

        // some tests on the newly created pricelist:
        const newPL = await PriceList.first({ _id: newPriceListId });
        expect(newPL).to.not.equal(undefined);
        expect(newPL.ownerId).to.not.equal(BIDDER_ACCOUNT_ID);
        expect(newPL.carrierId).to.equal(BIDDER_ACCOUNT_ID);
        expect(newPL.customerId).to.not.equal(BIDDER_ACCOUNT_ID);
        expect(newPL.status).to.equal("requested");
      });
    });
  });
  describe("create", function() {
    const context = {
      userId: USER_ID,
      accountId: OWNER_ACCOUNT_ID
    };
    it("[createTender] creates a tender", async function() {
      const args = {
        data: {
          title: "TEST DOCUMENT",
          milestones: [
            {
              title: "milestone1",
              date: new Date()
            },
            {
              title: "milestone2",
              date: new Date()
            }
          ]
        }
      };
      const res = await resolvers.Mutation.createTender(null, args, context);

      // checks:
      const testObj = {
        title: "TEST DOCUMENT",
        status: "draft",
        accountId: context.accountId,
        steps: ["general"]
      };
      Object.entries(testObj).forEach(([k, v]) => {
        expect(res[k]).to.eql(v);
      });

      // default milestones are now set in the params of the call (in order to get the translation)
      // expect(res.milestones[0].title).to.equal("Sent out RFQ to partners");
      // expect(res.milestones[1].title).to.equal("Deadline receiving RFQs");
      expect(res.contacts[0].userId).to.equal(context.userId);
      expect(res.contacts[0].role).to.equal("owner");
    });
  });
  describe("update", function() {
    const context = {
      userId: USER_ID,
      accountId: OWNER_ACCOUNT_ID
    };
    const tenderId = TENDER_ID;
    beforeEach(async function() {
      await resetCollections(["tenders"]);
      return null;
    });

    it("[updateTender] updates tender notes", async function() {
      const args = {
        input: {
          tenderId,
          update: { "notes.introduction": "test" }
        }
      };
      await resolvers.Mutation.updateTender(null, args, context);

      const testDoc = await Tender.first(tenderId);
      expect(testDoc.notes.introduction).to.equal("test");
    });
  });
  describe("Save bidders", function() {
    const context = {
      userId: USER_ID,
      accountId: OWNER_ACCOUNT_ID
    };
    const tenderId = TENDER_ID;
    beforeEach(async function() {
      await resetCollections(["tenders"]);
      return null;
    });

    it.skip("[saveBidders]", async function() {
      const args = {
        input: {
          tenderId,
          partnerIds: [BIDDER_USER_ID]
        }
      };
      const res = await resolvers.Mutation.saveBidders(null, args, context);
      expect(res).to.not.equal(undefined);
      expect(res).to.be.an("object");
      expect(res.errors).to.be.an("array");
      expect(res.success).to.be.an("object");
      expect(res.success.accountsAdded).to.equal(1);
      expect(res.success.accountsRemoved).to.equal(0);
    });
  });
  describe("Save bidders", function() {
    const context = {
      userId: USER_ID,
      accountId: OWNER_ACCOUNT_ID
    };
    const tenderId = TENDER_ID;
    beforeEach(async function() {
      await resetCollections(["tenders"]);
      return null;
    });

    it.skip("[saveBidders]", async function() {
      const args = {
        input: {
          tenderId,
          partnerIds: [BIDDER_USER_ID]
        }
      };
      const res = await resolvers.Mutation.saveBidders(null, args, context);
      expect(res).to.not.equal(undefined);
      expect(res).to.be.an("object");
      expect(res.errors).to.be.an("array");
      expect(res.success).to.be.an("object");
      expect(res.success.accountsAdded).to.equal(1);
      expect(res.success.accountsRemoved).to.equal(0);
    });
  });
  describe("remove attachment", function() {
    const context = {
      userId: USER_ID,
      accountId: OWNER_ACCOUNT_ID
    };
    const tenderId = TENDER_ID;
    beforeEach(async function() {
      await resetCollections(["tenders"]);
      return null;
    });

    it.skip("[removeAttachmentTender]", async function() {
      const args = {
        input: {
          tenderId,
          id: "25shjwe30"
        }
      };
      const res = await resolvers.Mutation.removeAttachmentTender(
        null,
        args,
        context
      );
      expect(res).to.not.equal(undefined);
      expect(res.id).to.equal(args.input.tenderId);
    });
  });
  describe("copy", function() {
    const context = {
      userId: USER_ID,
      accountId: OWNER_ACCOUNT_ID
    };
    const tenderId = TENDER_ID;
    beforeEach(async function() {
      await resetCollections(["tenders"]);
      return null;
    });

    it("[duplicateTender] duplicates a tender", async function() {
      const args = { input: { tenderId } };
      const res = await resolvers.Mutation.duplicateTender(null, args, context);

      expect(res).to.not.equal(undefined);
      expect(res.id).to.not.equal(tenderId);

      // comparing dates (without time):
      expect(res.created.at.setHours(0, 0, 0, 0)).to.equal(
        new Date().setHours(0, 0, 0, 0)
      );
    });
  });
  describe("status changes", function() {
    const context = {
      userId: USER_ID,
      accountId: OWNER_ACCOUNT_ID
    };
    const tenderId = TENDER_ID;
    beforeEach(async function() {
      await resetCollections(["tenders"]);
      return null;
    });
    it("releases a tender", async function() {
      // prep:
      await Tender._collection.update(
        { _id: tenderId },
        { $set: { status: "draft" } }
      );
      const args = {
        input: {
          tenderId,
          action: "release"
        }
      };
      const res = await resolvers.Mutation.updateTenderStatus(
        null,
        args,
        context
      );

      expect(res.status).to.equal("open");
    });
    it("drafts a tender", async function() {
      // prep:
      await Tender._collection.update(
        { _id: tenderId },
        { $set: { status: "open" } }
      );

      const args = {
        input: {
          tenderId,
          action: "setToDraft"
        }
      };
      const res = await resolvers.Mutation.updateTenderStatus(
        null,
        args,
        context
      );

      expect(res.status).to.equal("draft");
    });
    it("reviews a tender", async function() {
      // prep:
      await Tender._collection.update(
        { _id: tenderId },
        { $set: { status: "open" } }
      );

      const args = {
        input: {
          tenderId,
          action: "setToReview"
        }
      };
      const res = await resolvers.Mutation.updateTenderStatus(
        null,
        args,
        context
      );
      expect(res.status).to.equal("review");
    });
    it("closes a tender", async function() {
      // prep:
      await Tender._collection.update(
        { _id: tenderId },
        { $set: { status: "review" } }
      );

      const args = {
        input: {
          tenderId,
          action: "close"
        }
      };
      const res = await resolvers.Mutation.updateTenderStatus(
        null,
        args,
        context
      );

      expect(res.status).to.equal("closed");
    });
    it("cancels a tender", async function() {
      // prep:
      await Tender._collection.update(
        { _id: tenderId },
        { $set: { status: "draft" } }
      );
      const args = {
        input: {
          tenderId,
          action: "cancel"
        }
      };

      const res = await resolvers.Mutation.updateTenderStatus(
        null,
        args,
        context
      );

      expect(res.status).to.equal("canceled");
    });
  });
  describe("[tenderUpdateBidderDetail]", function() {
    const context = {
      userId: USER_ID,
      accountId: OWNER_ACCOUNT_ID
    };
    beforeEach(async function() {
      await resetCollections(["tenders"]);
      return null;
    });
    it.skip("update tender bider detail", async function() {
      const args = {
        input: {
          tenderId: TENDER_ID,
          partnerId: BIDDER_USER_ID,
          topic: "requirements",
          update: [
            {
              title: "requirement title 1",
              details: "requirement details 1",
              type: "hard",
              responseType: "YN",
              id: "MzWavs"
            }
          ]
        }
      };
      const res = await resolvers.Mutation.tenderUpdateBidderDetail(
        null,
        args,
        context
      );
      expect(res).to.not.equal(undefined);
    });
  });
  describe("[addAttachmentTender]", function() {
    const context = {
      userId: USER_ID,
      accountId: OWNER_ACCOUNT_ID
    };
    beforeEach(async function() {
      await resetCollections(["tenders"]);
      return null;
    });
    it.skip("addAttachmentTender", async function() {
      const args = {
        input: {
          tenderId: TENDER_ID,
          attachment: {
            id: "25shjwe30",
            name: "pdf",
            file: "xd.pdf"
          }
        }
      };
      const res = await resolvers.Mutation.addAttachmentTender(
        null,
        args,
        context
      );
      expect(res).to.not.equal(undefined);
      expect(res).to.be.an("object");
    });
  });
  describe("resolvers", function() {
    const context = {
      userId: USER_ID,
      accountId: OWNER_ACCOUNT_ID
    };
    const tenderId = TENDER_ID;
    beforeEach(async function() {
      await resetCollections(["tenders"]);
      return null;
    });
    it("[tender.packages] builds packages from a scope", async function() {
      const expectedOutcome = [
        {
          pickupCountry: "BE",
          bidGroups: [
            {
              pickupCountry: "BE",
              pickupZip: "*",
              deliveryCountry: "ES",
              deliveryZip: "18000",
              shipmentIds: [],
              quantity: {
                scopeCount: 8,
                shipCount: 393,
                totalAmount: 160,
                avgAmount: 20,
                minAmount: 3,
                maxAmount: 57,
                stdevAmount: 21.62,
                currentAvgLeadtime: null
              },
              id: "q5kj8b"
            },
            {
              pickupCountry: "BE",
              pickupZip: "*",
              deliveryCountry: "ES",
              deliveryZip: "28000",
              shipmentIds: [],
              quantity: {
                scopeCount: 8,
                shipCount: 391,
                totalAmount: 160,
                avgAmount: 20,
                minAmount: 3,
                maxAmount: 57,
                stdevAmount: 21.62,
                currentAvgLeadtime: null
              },
              id: "kkwzRh"
            }
          ]
        }
      ];

      // prep the db:
      await Tender._collection.update(
        { _id: tenderId },
        { $unset: { packages: 1 }, $set: { status: "draft" } }
      );
      debug("START");

      // action:
      await resolvers.Mutation.generateTenderPackages(
        null,
        { tenderId },
        context
      );

      // checks:
      const testDoc = await Tender.first(tenderId);
      debug("tenders: %j", testDoc.packages);

      expect(testDoc.packages).to.be.a("array");
      [
        "0.pickupCountry",
        "1.pickupCountry",
        "0.bidGroups.0.pickupCountry",
        "0.bidGroups.0.deliveryCountry",
        "1.bidGroups.0.pickupCountry",
        "1.bidGroups.0.deliveryCountry"
      ].forEach(path => {
        expect(get(testDoc.packages, path)).to.eql(
          get(expectedOutcome, path),
          path
        );
      });
    });
  });
});
