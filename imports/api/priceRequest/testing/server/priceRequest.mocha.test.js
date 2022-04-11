/* eslint-disable no-underscore-dangle */
/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */
import moment from "moment";
import { Random } from "/imports/utils/functions/random.js";
import { expect } from "chai";
import sinon from "sinon";
import { JobManager } from "/imports/utils/server/job-manager.js";

// collections
import { PriceRequest } from "../../PriceRequest";
import { AllAccounts } from "../../../allAccounts/AllAccounts";

import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection.js";
import { resolvers } from "../../apollo/resolvers";
import { Shipment } from "/imports/api/shipments/Shipment";

import { CheckPriceRequestSecurity } from "/imports/utils/security/checkUserPermissionsForRequest";

const ACCOUNT_ID = "S65957";
const USER_ID = "jsBor6o3uRBTFoRQY";
const PRICE_REQUEST_ID = "FYyFaceLqAeh5nnmo";
const PRICE_REQUEST_ID2 = "zgSR5RRWJoHMDSEDy";

const CARRIER_ID = "C11051";
const CARRIER_USER_ID = "pYFLYFDMJEnKADYXX";
const CARRIER_ID2 = "C75701";

const ADDITIONAL_SHIPMENT_ID = "2jG2mZFcaFzqaThXX";
const SHIPMENTS_WITHOUT_PR = ["2jG2mZFcaFzqaThXX", "2jG2mZFcaFzqaThYY"];

const printError = (checks, t) => `${t} - ${JSON.stringify(checks)}`;

let defaultMongo;
describe("priceRequest", function() {
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo");
      await defaultMongo.connect();
    }

    const resetDone = await resetDb({ resetUsers: true });
    if (!resetDone) throw Error("reset was not possible, test can not run!");
  });
  describe("security", function() {
    const ownerContext = {
      accountId: ACCOUNT_ID,
      userId: USER_ID
    };
    const roles = [
      "core-priceRequest-createForShipment",
      "core-priceRequest-create",
      "core-priceRequest-update",
      "core-priceRequest-edit-requirements",
      "core-priceRequest-edit-settings",
      "core-priceRequest-remove"
    ];
    const carrierContext = {
      accountId: CARRIER_ID,
      userId: CARRIER_USER_ID
    };
    let request;
    before(async function() {
      request = await PriceRequest.first(PRICE_REQUEST_ID);
      request.creatorId = ACCOUNT_ID;
      request.customerId = ACCOUNT_ID;
    });

    it("allows to create a request for a shipment if I am planner and owner of shipment", function() {
      const res = new CheckPriceRequestSecurity({ request }, ownerContext)
        .setUserRoles(roles)
        .can({
          action: "createRequestForShipment",
          data: {
            shipment: { accountId: ownerContext.accountId, status: "draft" }
          }
        })
        .check(true);

      expect(res).to.equal(true, "should be allowed as planner");

      // negative test"
      const check2 = new CheckPriceRequestSecurity(
        {
          request
        },
        carrierContext
      )
        .setUserRoles(roles)
        .can({ action: "createRequestForShipment" })
        .check();

      expect(check2).to.equal(false);
    });
    it("allows to view partners if I am owner of the request", function() {
      const check1 = new CheckPriceRequestSecurity({ request }, ownerContext)
        .setUserRoles(roles)
        .can({ action: "viewPartners" })
        .check();
      expect(check1).to.equal(true);

      // negative test"

      const check2 = new CheckPriceRequestSecurity(
        {
          request
        },
        carrierContext
      )
        .setUserRoles(roles)
        .can({ action: "viewPartners" })
        .check();
      expect(check2).to.equal(false);
    });
    it("allows to add partners if I am owner of the request & status is draft or open", function() {
      const check1 = new CheckPriceRequestSecurity({ request }, ownerContext)
        .setUserRoles(roles)
        .can({ action: "addPartners" })
        .check();
      expect(check1).to.equal(true, "eve should be allowed to see partners");

      // negative test"

      const check2 = new CheckPriceRequestSecurity(
        {
          request
        },
        carrierContext
      )
        .setUserRoles(roles)
        .can({ action: "addPartners" })
        .check();

      expect(check2).to.equal(false, "bob should not be allowed");

      const check3 = new CheckPriceRequestSecurity(
        {
          request: { ...request, status: "closed" }
        },
        carrierContext
      )
        .setUserRoles(roles)
        .can({ action: "addPartners" })
        .check();
      expect(check3).to.equal(false, "bod should not be allowed");
    });
    it("allows to be set to requested if owner & if has items", function() {
      const check1 = new CheckPriceRequestSecurity(
        {
          request: { ...request, status: "draft" }
        },
        ownerContext
      )
        .setUserRoles(roles)
        .can({ action: "canBeRequested" })
        .check();
      expect(check1).to.equal(true);

      // negative testing"
      const check2 = new CheckPriceRequestSecurity(
        {
          request: { ...request, status: "draft" }
        },
        carrierContext
      )
        .setUserRoles(roles)
        .can({ action: "canBeRequested" })
        .check();
      expect(check2).to.equal(false);
    });
    it("allows to be set back to draft if owner & if has status open", function() {
      const res = new CheckPriceRequestSecurity(
        {
          request: { ...request, status: "requested" }
        },
        ownerContext
      )
        .setUserRoles(roles)
        .can({ action: "canBeSetBackToDraft" })
        .check();
      expect(res).to.equal(true);

      // negative testing"
      const {
        checks: checks2,
        allowed: allowed2
      } = new CheckPriceRequestSecurity(
        {
          request: { ...request, status: "requested" }
        },
        carrierContext
      )
        .setUserRoles(roles)
        .can({ action: "canBeSetBackToDraft" });

      expect(allowed2).to.equal(
        false,
        printError(checks2, "canBeSetBackToDraft")
      );

      // can't be set back to draft when 'draft'
      const { checks, allowed } = new CheckPriceRequestSecurity(
        {
          request: { ...request, status: "draft" }
        },
        ownerContext
      )
        .setUserRoles(roles)
        .can({ action: "canBeSetBackToDraft" });

      expect(allowed).to.equal(
        false,
        printError(checks, "canBeSetBackToDraft")
      );
    });
    it("allows to be cancelled if owner & if has status draft", function() {
      const check1 = new CheckPriceRequestSecurity(
        {
          request: { ...request, status: "requested" }
        },
        ownerContext
      )
        .setUserRoles(roles)
        .can({ action: "canBeDeactivated" })
        .check();
      expect(check1).to.equal(true);

      // negative testing"

      const check2 = new CheckPriceRequestSecurity(
        {
          request: { ...request, status: "requested" }
        },
        carrierContext
      )
        .setUserRoles(roles)
        .can({ action: "canBeDeactivated" })
        .check();

      expect(check2).to.equal(false);
    });
    it("allows to be deleted if owner & if has status draft", function() {
      const check1 = new CheckPriceRequestSecurity(
        {
          request: { ...request, status: "draft" }
        },
        ownerContext
      )
        .setUserRoles(roles)
        .can({ action: "canBeDeleted" })
        .check();
      expect(check1).to.equal(true);

      // negative testing"

      const check2 = new CheckPriceRequestSecurity(
        {
          request: { ...request, status: "draft" }
        },
        carrierContext
      )
        .setUserRoles(roles)
        .can({ action: "canBeDeleted" })
        .check();

      expect(check2).to.equal(false);
    });
    it("allows to be archived if owner & if has status draft", function() {
      const check1 = new CheckPriceRequestSecurity(
        {
          request: { ...request, status: "draft" }
        },
        ownerContext
      )
        .setUserRoles(roles)
        .can({ action: "canBeArchived" })
        .check();
      expect(check1).to.equal(true);

      // negative testing"
      const check2 = new CheckPriceRequestSecurity(
        {
          request: { ...request, status: "draft" }
        },
        carrierContext
      )
        .setUserRoles(roles)
        .can({ action: "canBeArchived" })
        .check();

      expect(check2).to.equal(false);
    });
  });
  describe("createPriceRequest", function() {
    const context = {
      accountId: ACCOUNT_ID,
      userId: USER_ID
    };
    beforeEach(async function() {
      await resetCollections(["priceRequests", "shipments"]);
      return true;
    });
    it("throws an error when not logged in", async function() {
      let testError;
      try {
        await resolvers.Mutation.createPriceRequest(null, {}, {});
      } catch (error) {
        testError = error;
      }
      expect(testError).to.be.an("error");
      expect(testError.message).to.match(/not-authorized/);
    });
    it("creates a PR for a single shipment", async function() {
      const args = {
        items: [{ shipmentId: SHIPMENTS_WITHOUT_PR[0] }],
        type: "spot",
        title: "current",
        dueDate: "2021-10-06T20:09:59.504Z"
      };
      const res = await resolvers.Mutation.createPriceRequest(
        null,
        args,
        context
      );

      expect(res.priceRequestId).to.be.a("string");
      expect(res.priceRequest).to.be.an("object");

      // expect(res.priceRequest.creatorId).to.equal(context.accountId);
      expect(res.priceRequest.settings.templateId).to.not.equal(undefined);
      expect(res.priceRequest.dueDate).to.not.equal(undefined);

      expect(res.errors).to.be.an("array");
      expect(res.errors).to.have.lengthOf(0);

      expect(res.shipments).to.be.an("array");
      expect(res.shipments).to.have.lengthOf(1);

      expect(res.shipments[0].priceRequestId).to.not.equal(undefined);
      expect(res.shipments[0].linkPriceRequest).to.have.lengthOf(1);

      // is shipment Linked:
      const { priceRequestId } = await Shipment.first(SHIPMENTS_WITHOUT_PR[0], {
        fields: { priceRequestId: 1 }
      });
      expect(priceRequestId).to.not.equal(undefined);
      expect(priceRequestId).to.equal(res.priceRequestId);
    });
    it("creates a PR for a multiple shipment", async function() {
      const args = {
        type: "spot",
        items: SHIPMENTS_WITHOUT_PR.map(shipmentId => ({ shipmentId }))
      };
      const res = await resolvers.Mutation.createPriceRequest(
        null,
        args,
        context
      );

      expect(res.priceRequestId).to.be.a("string");
      expect(res.priceRequest).to.be.an("object");
      expect(res.priceRequest.creatorId).to.equal(context.accountId);
      expect(res.priceRequest.settings.templateId).to.not.equal(undefined);
      expect(res.priceRequest.dueDate).to.not.equal(undefined);

      expect(res.errors).to.be.an("array");
      expect(res.errors).to.have.lengthOf(0);

      expect(res.shipments).to.be.an("array");
      expect(res.shipments).to.have.lengthOf(2);

      expect(res.shipments[0].priceRequestId).to.not.equal(undefined);
      expect(res.shipments[0].linkPriceRequest).to.have.lengthOf(1);
    });
    it("returns errors when items do not exist", async function() {
      const args = {
        type: "spot",
        items: [{ shipmentId: "doesNotExist" }]
      };
      const res = await resolvers.Mutation.createPriceRequest(
        null,
        args,
        context
      );

      expect(res.priceRequest).to.equal(undefined);
      expect(res.errors).to.have.lengthOf(1);
      expect(res.errors[0].issue).to.equal("notFound");
      expect(res.validItems).to.equal(0);
    });
  });
  describe("updatePriceRequest", function() {
    const context = {
      accountId: ACCOUNT_ID,
      userId: USER_ID
    };
    beforeEach(async function() {
      await resetCollections(["priceRequests", "shipments"]);
      return true;
    });
    it("throws an error when not logged in", async function() {
      try {
        resolvers.Mutation.updatePriceRequest(null, {}, {});
      } catch (error) {
        expect(error).to.be.an("error");
        expect(error.message).to.match(/not-allowed/);
      }
    });
    it("unsets linked priceRequestId when deleting a PR", async function() {
      const args = {
        input: {
          priceRequestId: PRICE_REQUEST_ID,
          update: { status: "deleted" }
        }
      };
      const priceRequest = await resolvers.Mutation.updatePriceRequest(
        null,
        args,
        context
      );

      expect(priceRequest).to.not.equal(undefined);
      expect(priceRequest.status).to.equal("deleted");

      const shipmentIds = priceRequest.items.map(
        ({ shipmentId }) => shipmentId
      );

      // is shipment Linked:
      const shipments = await Shipment.where(
        { _id: { $in: shipmentIds } },
        {
          fields: { priceRequestId: 1 }
        }
      );
      shipments.forEach(shipment => {
        expect(shipment.priceRequestId).to.equal(undefined);
      });
    });
  });
  describe("postponePriceRequest", function() {
    const context = {
      accountId: ACCOUNT_ID,
      userId: USER_ID
    };
    beforeEach(async function() {
      await resetCollections(["priceRequests", "shipments"]);
      return true;
    });
    it("throws an error when not logged in", async function() {
      let testError;
      try {
        await resolvers.Mutation.postponePriceRequest(null, {}, {});
      } catch (error) {
        testError = error;
      }
      expect(testError).to.be.an("error");
      expect(testError.message).to.match(/not-authorized/);
    });
    it("postponePriceRequest", async function() {
      const args = {
        input: {
          priceRequestId: PRICE_REQUEST_ID,
          dueDate: "2021-10-05T20:09:59.504Z"
        }
      };
      const priceRequestPostpone = await resolvers.Mutation.postponePriceRequest(
        null,
        args,
        context
      );
      expect(priceRequestPostpone).to.not.equal(undefined);
      expect(priceRequestPostpone.id).to.equal(PRICE_REQUEST_ID);
      expect(priceRequestPostpone.dueDate).to.equal(args.input.dueDate);
    });
  });
  describe("updateBidderTSPriceRequest", function() {
    const context = {
      accountId: ACCOUNT_ID,
      userId: USER_ID
    };
    beforeEach(async function() {
      await resetCollections(["priceRequests", "shipments"]);
      return true;
    });
    it("throws an error when not logged in", async function() {
      try {
        resolvers.Mutation.updateBidderTSPriceRequest(null, {}, {});
      } catch (error) {
        expect(error).to.be.an("error");
        expect(error.message).to.match(/not-allowed/);
      }
    });
    it("updateBidderTSPriceRequest", async function() {
      const args = {
        priceRequestId: PRICE_REQUEST_ID
      };
      const res = await resolvers.Mutation.updateBidderTSPriceRequest(
        null,
        args,
        context
      );
      expect(res).to.not.equal(undefined);
      expect(res).to.be.a("string");
    });
  });
  describe("placeSimpleBidPriceRequest", function() {
    const context = {
      accountId: ACCOUNT_ID,
      userId: USER_ID
    };
    beforeEach(async function() {
      await resetCollections([
        "priceRequests",
        "shipments",
        "users",
        "accounts"
      ]);
      return true;
    });
    it("throws an error when not logged in", async function() {
      let errorTest;
      try {
        await resolvers.Mutation.placeSimpleBidPriceRequest(null, {}, {});
      } catch (error) {
        errorTest = error;
      }
      expect(errorTest).to.be.an("error");
      expect(errorTest.message).to.match(/not-authorized/);
    });

    it.skip("placeSimpleBidPriceRequest", async function() {
      const args = {
        input: {
          priceRequestId: PRICE_REQUEST_ID2,
          items: [{ shipmentId: SHIPMENTS_WITHOUT_PR[0] }]
        }
      };
      const res = await resolvers.Mutation.placeSimpleBidPriceRequest(
        null,
        args,
        context
      );
      expect(res).to.not.equal(undefined);
    });
  });
  describe("addItemsToRequest", function() {
    const context = {
      accountId: ACCOUNT_ID,
      userId: USER_ID
    };
    beforeEach(async function() {
      await resetCollections(["priceRequests", "shipments"]);
      return true;
    });
    it("throws an error when not logged in", async function() {
      let testError;
      try {
        await resolvers.Mutation.addItemsToRequest(null, { input: {} }, {});
      } catch (error) {
        testError = error;
      }
      expect(testError).to.be.an("error");
      expect(testError.message).to.match(/not-authorized/);
    });
    it("adds items to a PR", async function() {
      const args = {
        input: {
          priceRequestId: PRICE_REQUEST_ID,
          items: [{ shipmentId: SHIPMENTS_WITHOUT_PR[0] }]
        }
      };

      // addItemsToRequest(input: addItemsToRequestInput): CreatePriceRequestResponse
      const res = await resolvers.Mutation.addItemsToRequest(
        null,
        args,
        context
      );
      expect(res.priceRequestId).to.equal(PRICE_REQUEST_ID);
      expect(res.priceRequest).to.be.an("object");

      expect(res.errors).to.be.an("array");
      expect(res.errors).to.have.lengthOf(0);

      expect(res.shipments).to.be.an("array");

      // the first item is not in the database.... therefore it only has 1 items returned instead of 2...

      const returendShipmentIds = res.shipments.map(({ id }) => id);
      expect(returendShipmentIds).to.include(SHIPMENTS_WITHOUT_PR[0]);

      // is shipment Linked:
      const { priceRequestId } = await Shipment.first(SHIPMENTS_WITHOUT_PR[0], {
        fields: { priceRequestId: 1 }
      });
      expect(priceRequestId).to.not.equal(undefined);
      expect(priceRequestId).to.equal(res.priceRequestId);
    });
  });
  describe("updatePriceRequestStatus", function() {
    const context = {
      accountId: ACCOUNT_ID,
      userId: USER_ID
    };
    const priceRequestId = PRICE_REQUEST_ID;
    beforeEach(async function() {
      await resetCollections(["priceRequests"]);
      await PriceRequest._collection.update(
        { _id: priceRequestId },
        {
          $set: {
            status: "draft",
            creatorId: ACCOUNT_ID,
            bidders: [
              {
                accountId: "SomeID",
                name: "dummy"
              },
              { accountId: CARRIER_ID, name: "testing Bidder" }
            ]
          }
        }
      );
    });
    it("[updatePriceRequestStatus]throws when not logged in", async function() {
      let result;
      try {
        result = await resolvers.Mutation.updatePriceRequestStatus(
          null,
          { input: {} },
          {}
        );
      } catch (error) {
        result = error;
      }
      expect(result).to.be.an("error");
      expect(result.message).to.match(/not-authorized/);
    });

    it("[addMatchingBiddersPriceRequest]throws when not logged in", async function() {
      const args = { input: { priceRequestId } };
      let result;
      try {
        result = await resolvers.Mutation.addMatchingBiddersPriceRequest(
          null,
          args,
          context
        );
      } catch (error) {
        result = error;
      }
      expect(result).to.be.an("error");
      expect(result.message).to.match(
        /missing GOOGLE_CREDENTIALS, no BQ suggestions possible/
      );
    });

    it("[updatePriceRequestStatus]sets status to requested", async function() {
      await PriceRequest._collection.update(
        { _id: priceRequestId },
        {
          $set: {
            status: "draft",
            dueDate: moment()
              .add(1, "week")
              .toDate()
          }
        }
      );
      const args = { input: { priceRequestId, action: "request" } };
      await resolvers.Mutation.updatePriceRequestStatus(null, args, context);
      const doc = await PriceRequest.first(priceRequestId);
      expect(doc.status).to.equal("requested");

      // increase version with each requested status:
      expect(doc.version).to.equal(2);
    });
    it("[updatePriceRequestStatus][throws]sets status to requested on past due date", async function() {
      // data prep:
      // request back to draft and due date in past
      await PriceRequest._collection.update(
        { _id: priceRequestId },
        {
          $set: {
            status: "draft",
            dueDate: new Date("2019-01-01")
          }
        }
      );

      const args = { input: { priceRequestId, action: "request" } };
      let testError;
      try {
        await resolvers.Mutation.updatePriceRequestStatus(null, args, context);
      } catch (error) {
        testError = error;
      }
      expect(testError).to.be.an("error");
      expect(testError.message).to.match(/not-allowed/);
    });
    it("[updatePriceRequestStatus][throws]sets status to requested without items", async function() {
      // request back to draft and due date in past
      await PriceRequest._collection.update(
        { _id: priceRequestId },
        {
          $set: {
            status: "draft",
            dueDate: new Date("2029-01-01")
          },
          $unset: { items: 1 }
        }
      );
      const args = { input: { priceRequestId, action: "request" } };
      let testError;
      try {
        await resolvers.Mutation.updatePriceRequestStatus(null, args, context);
      } catch (error) {
        testError = error;
      }
      expect(testError).to.be.an("error");
      expect(testError.message).to.match(/not-allowed/);
    });

    it("[updatePriceRequestStatus]sets status to draft", async function() {
      // prepare:
      await PriceRequest._collection.update(
        { _id: priceRequestId },
        { $set: { status: "requested" } }
      );

      const args = { input: { priceRequestId, action: "setToDraft" } };
      const res = await resolvers.Mutation.updatePriceRequestStatus(
        null,
        args,
        context
      );

      expect(res.status).to.equal("draft");
    });
    it("[updatePriceRequestStatus]sets status to archived", async function() {
      // status is equal to "draft" -> put to archived
      const args = { input: { priceRequestId, action: "archive" } };
      const res = await resolvers.Mutation.updatePriceRequestStatus(
        null,
        args,
        context
      );

      expect(res.status).to.equal("archived");
    });
    it("sets status to deleted", async function() {
      // status is equal to "requested" -> put requested to deleted
      await PriceRequest._collection.update(
        { _id: priceRequestId },
        { $set: { status: "requested" } }
      );

      const args = { input: { priceRequestId, action: "delete" } };
      const res = await resolvers.Mutation.updatePriceRequestStatus(
        null,
        args,
        context
      );

      expect(res.status).to.equal("deleted");
    });
  });
  describe("updatePriceRequestBidders", function() {
    const context = {
      accountId: ACCOUNT_ID,
      userId: USER_ID
    };
    const carrierId2 = CARRIER_ID2;
    const carrierId = CARRIER_ID;
    const priceRequestId = PRICE_REQUEST_ID;
    let spyFn;
    let contacts;
    before(async function() {
      spyFn = sinon.spy(JobManager, "post");
    });
    after(function() {
      spyFn.restore();
    });
    beforeEach(async function() {
      await resetCollections(["priceRequests", "users", "accounts"]);
      await PriceRequest._collection.update(
        { _id: priceRequestId },
        { $set: { creatorId: ACCOUNT_ID } }
      );
      contacts = [
        { linkedId: Random.id(), mail: "test1@test.com" },
        { mail: "test2@test.com" }
      ];
      await AllAccounts._collection.update(
        { _id: carrierId },
        {
          $set: {
            // annotation data
            accounts: [
              {
                accountId: ACCOUNT_ID,
                name: "another name 1",
                profile: {
                  contacts
                }
              }
            ]
          }
        }
      );
    });
    it("[updatePriceRequestBidders]throws error when not logged in", async function() {
      let testError;
      try {
        await resolvers.Mutation.updatePriceRequestBidders(
          null,
          { input: {} },
          {}
        );
      } catch (error) {
        testError = error;
      }
      expect(testError).to.be.an("error");
      expect(testError.message).to.match(/not-authorized/);
    });
    it("[updatePriceRequestBidders]adds bidders to the bidders array when in draft", async function() {
      this.timeout(30000);

      // remove any existing bidders
      await resolvers.Mutation.updatePriceRequestBidders(
        null,
        { input: { priceRequestId, partnerIds: [] } },
        context
      );

      // add 2 bidders
      const res = await resolvers.Mutation.updatePriceRequestBidders(
        null,
        {
          input: {
            priceRequestId,
            partnerIds: [carrierId, carrierId2]
          }
        },
        context
      );

      expect(res.errors).to.have.lengthOf(0);
      expect(res.accountsAdded).to.equal(2);

      const updatedDoc = await PriceRequest.first(priceRequestId, {
        fields: { bidders: 1 }
      });

      expect(updatedDoc.bidders).to.have.lengthOf(
        2,
        "there should be 2 bidders in the array"
      );

      const bidderCarrier1 = updatedDoc.bidders.find(
        ({ accountId: id }) => id === carrierId
      );

      expect(bidderCarrier1.accountId).to.equal(carrierId);
      expect(bidderCarrier1.contacts).to.have.lengthOf(
        2,
        `the contacts should have been copied over obj :${JSON.stringify(
          updatedDoc.bidders
        )}`
      );

      expect(bidderCarrier1.contacts[0].userId).to.equal(contacts[0].userId);
      expect(bidderCarrier1.contacts[0].mail).to.equal(contacts[0].mail);
      expect(bidderCarrier1.contacts[1].mail).to.equal(contacts[1].mail);
    });
    it("[updatePriceRequestBidders]throws error when not logged in", async function() {
      let testError;
      try {
        await resolvers.Mutation.updatePriceRequestBidders(
          null,
          { input: {} },
          {}
        );
      } catch (error) {
        testError = error;
      }
      expect(testError).to.be.an("error");
      expect(testError.message).to.match(/not-authorized/);
    });
    it("removes 1 bidder from the bidders array after a new update", async function() {
      // set two carriers
      await resolvers.Mutation.updatePriceRequestBidders(
        null,
        {
          input: {
            priceRequestId,
            partnerIds: [carrierId, carrierId2]
          }
        },
        context
      );

      // keep only one
      const res = await resolvers.Mutation.updatePriceRequestBidders(
        null,
        {
          input: {
            priceRequestId,
            partnerIds: [carrierId]
          }
        },
        context
      );

      const updatedDoc = await PriceRequest.first(priceRequestId);
      expect(res.errors).to.have.lengthOf(0);
      expect(updatedDoc.bidders).to.have.lengthOf(
        1,
        "should have removed carrierId2"
      );

      expect(updatedDoc.bidders[0].accountId).to.equal(carrierId);
    });
    it("adds 1 bidder to the bidders array after a new update", async function() {
      // add another bidder
      await resolvers.Mutation.updatePriceRequestBidders(
        null,
        {
          input: {
            priceRequestId,
            partnerIds: [carrierId]
          }
        },
        context
      );

      const res = await resolvers.Mutation.updatePriceRequestBidders(
        null,
        {
          input: {
            priceRequestId,
            partnerIds: [carrierId, carrierId2]
          }
        },
        context
      );

      const updatedDoc = await PriceRequest.first(priceRequestId);
      expect(res.errors).to.have.lengthOf(0);
      expect(updatedDoc.bidders).to.have.lengthOf(2, "should have two bidders");
      const bidderCarrier1 = updatedDoc.bidders.find(
        ({ accountId: id }) => id === carrierId
      );
      const bidderCarrier2 = updatedDoc.bidders.find(
        ({ accountId: id }) => id === carrierId2
      );
      expect(bidderCarrier1.accountId).to.equal(carrierId);
      expect(bidderCarrier2.accountId).to.equal(carrierId2);
    });
    it("a bidder that has placed a bid already (status requested)", async function() {
      this.timeout(30000);
      await resolvers.Mutation.updatePriceRequestBidders(
        null,
        {
          input: {
            priceRequestId,
            partnerIds: [carrierId]
          }
        },
        context
      );

      // prep some data: (assume first onehas place a bid)
      await PriceRequest._collection.update(
        { _id: priceRequestId },
        { $set: { status: "requested", "bidders.0.bid": true } }
      );
      const res = await resolvers.Mutation.updatePriceRequestBidders(
        null,
        {
          input: {
            priceRequestId,
            partnerIds: [carrierId2]
          }
        },
        context
      );

      expect(res.errors).to.have.lengthOf(0);
      expect(res.warnings).to.have.lengthOf(1);
      expect(res.warnings[0].partnerId).to.equal(carrierId);
      expect(res.accountsAdded).to.equal(
        1,
        "1 accounts should have been added"
      );
      expect(res.accountsRemoved).to.equal(
        1,
        "1 accounts should have been removed"
      );
      const updatedDoc = await PriceRequest.first(priceRequestId);
      expect(updatedDoc.bidders).to.have.lengthOf(1, "should have 1 bidders");
      expect(
        updatedDoc.bidders.find(el => el.accountId === carrierId2)
      ).to.be.an("object", "carrierId2 should still be in the array");
    });
    it("sends out cancellation mail when removed while status requested", async function() {
      await resolvers.Mutation.updatePriceRequestBidders(
        null,
        {
          input: {
            priceRequestId,
            partnerIds: [carrierId]
          }
        },
        context
      );

      // prep some data: (assume first one has place a bid)
      await PriceRequest._collection.update(
        { _id: priceRequestId },
        { $set: { status: "requested", "bidders.0.bid": false } }
      );
      const res = await resolvers.Mutation.updatePriceRequestBidders(
        null,
        {
          input: {
            priceRequestId,
            partnerIds: [carrierId2]
          }
        },
        context
      );

      expect(res.errors).to.have.lengthOf(0);
      expect(res.accountsRemoved).to.equal(1);

      sinon.assert.calledWith(spyFn, "price-request.cancelled");
    });
    it("sends out invitation mail when added while status requested", async function() {
      await resolvers.Mutation.updatePriceRequestBidders(
        null,
        {
          input: {
            priceRequestId,
            partnerIds: [carrierId]
          }
        },
        context
      );

      // prep some data: (assume first one has place a bid)
      await PriceRequest._collection.update(
        { _id: priceRequestId },
        { $set: { status: "requested", "bidders.0.bid": true } }
      );
      const res = await resolvers.Mutation.updatePriceRequestBidders(
        null,
        {
          input: {
            priceRequestId,
            partnerIds: [carrierId, carrierId2]
          }
        },
        context
      );

      expect(res.errors).to.have.lengthOf(0);

      sinon.assert.calledWith(spyFn, "price-request.requested");
    });
    it("throws an error when you are not allowed to modify", async function() {
      // status is nin ["draft", "requested"]
      // prep some data:
      await PriceRequest._collection.update(
        { _id: priceRequestId },
        { $set: { status: "archived" } }
      );
      let testError;
      try {
        await resolvers.Mutation.updatePriceRequestBidders(
          null,
          { input: { priceRequestId, partnerIds: [] } },
          context
        );
      } catch (error) {
        testError = error;
      }
      expect(testError).to.be.an("error");
      expect(testError.message).to.match(/not-allowed/);

      // when you are not the owner account:
      const bidderContext = {
        accountId: CARRIER_ID,
        userId: CARRIER_USER_ID
      };
      testError = undefined;
      try {
        await resolvers.Mutation.updatePriceRequestBidders(
          null,
          { input: { priceRequestId, partnerIds: [] } },
          bidderContext
        );
      } catch (error) {
        testError = error;
      }
      expect(testError).to.be.an("error");
      expect(testError.message).to.match(/not-allowed/);
    });
  });
  describe("resolvers", function() {
    const context = {
      accountId: ACCOUNT_ID,
      userId: USER_ID
    };
    const carrierContext = {
      accountId: CARRIER_ID,
      userId: CARRIER_USER_ID
    };

    const priceRequestId = PRICE_REQUEST_ID2;
    describe("add matching bidder", function() {
      beforeEach(async function() {
        await resetCollections(["priceRequests", "users", "accounts"]);
      });
      it.skip("[addMatchingBiddersPriceRequest]", async function() {
        const args = {
          priceRequestId
        };
        const res = await resolvers.Mutation.addMatchingBiddersPriceRequest(
          null,
          args,
          context
        );
        expect(res).to.not.equal(undefined);
        expect(res.priceRequest).to.be.an("object");
        expect(res.priceRequest.id).to.equal(args.priceRequestId);
        expect(res.suggestedCarriers).to.be.an("array");
        expect(res.bestPartners).to.be.an("array");
        expect(res.selectedPartners).to.be.an("array");
      });
    });
    describe("query resolvers", function() {
      // bidders field is projected
      // if carrier -> filter to own
      // if owner -> all
      beforeEach(async function() {
        await resetCollections(["priceRequests", "users", "accounts"]);
        await PriceRequest._collection.update(
          { _id: priceRequestId },
          {
            $set: { creatorId: ACCOUNT_ID },
            $push: {
              items: {
                shipmentId: ADDITIONAL_SHIPMENT_ID
              }
            }
          }
        );
      });
      it("[resolver][bidders] as owner", async function() {
        const priceRequest = await PriceRequest.first(priceRequestId);
        const bidders = await resolvers.PriceRequest.bidders(
          priceRequest,
          {},
          context
        );

        expect(bidders).to.have.lengthOf(2, "owner can see all bidders");
      });
      it("[resolver][bidders] as bidder - not offered", async function() {
        const priceRequest = await PriceRequest.first(priceRequestId);
        const bidders = await resolvers.PriceRequest.bidders(
          priceRequest,
          {},
          carrierContext
        );

        expect(bidders).to.have.lengthOf(
          1,
          "bidders should be filtered to only show own bids"
        );
        expect(bidders[0].accountId).to.equal(CARRIER_ID);

        expect(bidders[0].simpleBids).to.have.lengthOf(2);
        expect(bidders[0].simpleBids[0].shipmentId).to.equal(
          priceRequest.items[0].shipmentId
        );
        expect(bidders[0].simpleBids[1].shipmentId).to.equal(
          priceRequest.items[1].shipmentId
        );

        expect(bidders[0].simpleBids[0].chargeLines[0].amount.value).to.equal(
          0
        );
        expect(bidders[0].simpleBids[1].chargeLines[0].amount.value).to.equal(
          0
        );
      });
      it("[resolver][bidders] as bidder - offered", async function() {
        const simpleBids = [
          {
            date: new Date(),
            shipmentId: "2jG2mZFcaFzqaThcr",
            chargeLines: [
              {
                chargeId: "kvrTMnuzXcpMvACTg",
                name: "Base rate",
                costId: "o6fLThAWhaWW3uDaj",
                amount: {
                  value: 2000,
                  unit: "EUR"
                },
                comment: "testing some things here"
              }
            ],
            notes: ""
          }
        ];
        await PriceRequest._collection.update(
          { _id: priceRequestId, "bidders.accountId": CARRIER_ID },
          { $set: { "bidders.$.simpleBids": simpleBids } }
        );

        const priceRequest = await PriceRequest.first(priceRequestId);
        const bidders = await resolvers.PriceRequest.bidders(
          priceRequest,
          {},
          carrierContext
        );

        expect(bidders).to.have.lengthOf(
          1,
          "bidders should be filtered to only show own bids"
        );
        expect(bidders[0].accountId).to.equal(CARRIER_ID);

        expect(bidders[0].simpleBids).to.have.lengthOf(2);
        expect(bidders[0].simpleBids[0].shipmentId).to.equal(
          priceRequest.items[0].shipmentId
        );
        expect(bidders[0].simpleBids[1].shipmentId).to.equal(
          priceRequest.items[1].shipmentId
        );

        expect(bidders[0].simpleBids[0].chargeLines[0].chargeId).to.equal(
          "kvrTMnuzXcpMvACTg"
        );
        expect(bidders[0].simpleBids[0].chargeLines[0].amount.value).to.equal(
          2000
        );
        expect(bidders[0].simpleBids[1].chargeLines[0].amount.value).to.equal(
          0
        );
      });
    });
  });
});
