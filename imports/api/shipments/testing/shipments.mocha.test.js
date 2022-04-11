/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
import moment from "moment";
import { Meteor } from "meteor/meteor";
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection";
import { expect } from "chai";
import { prepareDataCopy } from "./tests/testCopy";
import { Address } from "/imports/api/addresses/Address";

import { shipmentCopy } from "/imports/api/shipments/services/shipment-copy.js";
import { resolvers } from "/imports/api/shipments/apollo/resolvers";
import { Stage } from "/imports/api/stages/Stage.js";
import { Shipment } from "../Shipment";
import { SHIPMENT_KEYS, STAGE_KEYS } from "./tests/_requiredKeysTest";
import { CheckShipmentSecurity } from "/imports/utils/security/checkUserPermissionForShipment";
import { ShipmentItem } from "../../items/ShipmentItem";

const debug = require("debug")("shipment:test");

const ACCOUNT_ID = "S65957";
const USER_ID = "jsBor6o3uRBTFoRQY";
const SHIPMENT_ID = "2jG2mZFcaFzqaThcr";
const ADDRESS_ID1 = "j958tYA872PAogTDq";
const ADDRESS_ID2 = "4958tYA872PAogTDq";

function prepareDataCreate() {
  return {
    pickup: {
      location: {
        type: "address",
        id: ADDRESS_ID1
      },
      date: moment()
        .add(1, "day")
        .startOf("day")
        .toDate()
    },
    delivery: {
      location: {
        type: "address",
        id: ADDRESS_ID2
      },
      date: moment()
        .add(5, "days")
        .startOf("day")
        .toDate()
    }
  };
}

let defaultMongo;
describe("shipments async", function() {
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../.testing/mocha/DefaultMongo");
      await defaultMongo.connect();
    }

    const resetDone = await resetDb({ resetUsers: true });
    if (!resetDone) throw Error("reset was not possible, test can not run!");
    Meteor.setUserId && Meteor.setUserId(USER_ID);
  });
  describe("resolvers", function() {
    describe("[shipment.create.UI] create shipment", function() {
      before(async function() {
        await resetCollections(["shipments"]);
      });
      let args;

      const context = {
        accountId: ACCOUNT_ID,
        userId: USER_ID
      };
      before(function() {
        args = prepareDataCreate(ACCOUNT_ID);
      });

      it("throws an error when not logged in", async function() {
        const mockArgs = { input: { ...args } };
        let testError;
        try {
          await resolvers.Mutation.createShipment(null, mockArgs, {});
        } catch (error) {
          testError = error;
        }
        expect(testError).to.be.an("error");
        expect(testError.message).to.match(/not-authorized/);
      });
      it("creates a shipment when logged in", async function() {
        const mockArgs = { input: { ...args } };
        const { accountId } = context;

        const shipmentId = await resolvers.Mutation.createShipment(
          null,
          mockArgs,
          context
        );
        expect(shipmentId).to.be.a("string");

        // check if address is properly set:
        // annotated date should be properly copied over
        const shipment = await Shipment.first(shipmentId);
        expect(shipment.shipperId).to.equal(accountId);
        expect(shipment.accountId).to.equal(accountId);

        const [from, to] = await Promise.all([
          Address.first(ADDRESS_ID1),
          Address.first(ADDRESS_ID2)
        ]);
        expect(shipment.pickup.location.name).to.equal(from.accounts[0].name);
        expect(shipment.delivery.location.name).to.equal(to.accounts[0].name);

        // some keys are set async (stageIds) so we can not check these here!
        expect(shipment).to.include.keys(SHIPMENT_KEYS);

        // have the stages been built?
        const stages = await Stage.where({ shipmentId });
        expect(stages).to.have.lengthOf(1);
        expect(stages[0]).to.include.keys(STAGE_KEYS);

        // have the timeZones been copied over??
        expect(shipment.pickup.location.timeZone).to.not.equal(undefined);
        expect(shipment.delivery.location.timeZone).to.not.equal(undefined);
        expect(stages[0].from.timeZone).to.not.equal(undefined);
        expect(stages[0].to.timeZone).to.not.equal(undefined);
      });
      it("creates a shipment - request", async function() {
        const mockArgs = { input: { ...args, isRequest: true } };
        const { accountId } = context;

        const shipmentId = await resolvers.Mutation.createShipment(
          null,
          mockArgs,
          context
        );
        expect(shipmentId).to.be.a("string");

        // check if address is properly set:
        // annotated date should be properly copied over
        const shipment = await Shipment.first(shipmentId);
        expect(shipment.shipperId).to.equal(accountId);
        expect(shipment.accountId).to.equal(accountId);

        expect(shipment.request).to.not.equal(undefined);
        expect(shipment.request).to.be.an("object");
        expect(shipment.request.requestedOn).to.be.a("date");
        expect(shipment.request.status).to.equal("draft");
      });
    });
    describe("[shipment.update.tags] update shipment tags", function() {
      before(async function() {
        await resetCollections(["shipments"]);
      });
      const context = {
        accountId: ACCOUNT_ID,
        userId: USER_ID
      };

      it("[updateShipmentTags]", async function() {
        const args = {
          shipmentId: SHIPMENT_ID,
          tags: ["fixture shipment", "testing", "Globex"]
        };
        const res = await resolvers.Mutation.updateShipmentTags(
          null,
          args,
          context
        );
        expect(res).to.not.equal(undefined);
        expect(res.id).to.equal(args.shipmentId);
        expect(res.tags).to.deep.include.members([
          "fixture shipment",
          "testing",
          "Globex"
        ]);
      });
    });
    describe("[shipment.update.partner] update shipment partners", function() {
      before(async function() {
        await resetCollections(["shipments"]);
      });
      const context = {
        accountId: ACCOUNT_ID,
        userId: USER_ID
      };

      it.skip("[updateShipmentPartner]", async function() {
        const args = {
          input: {
            shipmentId: SHIPMENT_ID,
            partner: {
              partnerId: ACCOUNT_ID,
              role: "shipper"
            },
            remove: true
          }
        };
        const res = await resolvers.Mutation.updateShipmentPartner(
          null,
          args,
          context
        );
        expect(res).to.not.equal(undefined);
        expect(res.id).to.equal(args.shipmentId);
      });
    });
    describe("[shipment.unlink.priceRequest] unlink priceRequest", function() {
      before(async function() {
        await resetCollections(["shipments"]);
      });
      const context = {
        accountId: ACCOUNT_ID,
        userId: USER_ID
      };

      it.skip("[unlinkPriceRequestFromShipment]", async function() {
        const args = {
          shipmentId: SHIPMENT_ID
        };
        const res = await resolvers.Mutation.unlinkPriceRequestFromShipment(
          null,
          args,
          context
        );
        expect(res).to.not.equal(undefined);
        expect(res.id).to.equal(args.shipmentId);
      });
    });
    describe("[shipment.duplicate] copy", function() {
      before(async function() {
        await resetCollections(["shipments"]);
      });
      let shipmentId;
      const context = {
        accountId: ACCOUNT_ID,
        userId: USER_ID
      };
      const { accountId } = context;
      before(async function() {
        await Shipment._collection.remove({});
        shipmentId = await prepareDataCopy(USER_ID);
        return true;
      });

      it("copies a shipment", async function() {
        expect(shipmentId).to.be.an("string");
        const srv = shipmentCopy({ ...context });
        await srv.init({ shipmentId });
        const result = await srv.copyShipment();
        debug("copy done ");
        expect(result.itemsNested).to.be.an("array");
      });
      it("copies a shipment with stage and items", async function() {
        const mockArgs = { input: { shipmentId } };

        const newShipmentId = await resolvers.Mutation.duplicateShipment(
          null,
          mockArgs,
          context
        );

        debug("duplicateShipment checks", newShipmentId);
        expect(newShipmentId).to.be.a("string");

        // check shipment
        const newShipment = await Shipment.findOne(newShipmentId);
        expect(newShipment).to.not.equal(undefined);
        expect(newShipment.updates).to.have.lengthOf(1); // mod of jan (to draft is added )
        expect(newShipment).to.include.keys(SHIPMENT_KEYS);
        expect(newShipment.accountId).to.equal(accountId);
        expect(newShipment.pickup.datePlanned).to.not.equal(undefined);
        expect(newShipment.delivery.datePlanned).to.not.equal(undefined);
        expect(newShipment.pickup.dateScheduled).to.equal(undefined);
        expect(newShipment.delivery.dateScheduled).to.equal(undefined);

        // check stages
        debug("check stages", newShipmentId);
        const stages = await Stage.where({ shipmentId: newShipmentId });
        expect(stages)
          .to.be.an("array")
          .to.have.lengthOf(1);
        expect(stages[0]).to.include.keys(STAGE_KEYS);
        expect(stages[0].dates).to.not.equal(undefined);
        expect(stages[0].dates.pickup.arrival.planned).to.not.equal(undefined);
        expect(stages[0].dates.delivery.arrival.planned).to.not.equal(
          undefined
        );
        expect(stages[0].dates.delivery.arrival.scheduled).to.equal(undefined);
        expect(stages[0].dates.pickup.arrival.scheduled).to.equal(undefined);

        // check items nested
        debug("check nestedItems", newShipmentId);
        const nestedItems = await newShipment.getNestedItems();
        expect(nestedItems).to.have.lengthOf(4);

        const lvlOneItem = nestedItems.find(({ level }) => level === 1);
        const { parentItemId } = lvlOneItem;
        const parentItem = nestedItems.find(({ _id }) => _id === parentItemId);
        expect(parentItem).to.not.equal(undefined);
        expect(parentItem.level).to.equal(0);
      });

      it("copies a shipment with stage & keepDates options", async function() {
        const mockArgs = {
          input: { shipmentId, options: { keepDates: true } }
        };

        const newShipmentId = await resolvers.Mutation.duplicateShipment(
          null,
          mockArgs,
          context
        );

        debug("duplicateShipment checks", newShipmentId);
        expect(newShipmentId).to.be.a("string");

        // check stages
        debug("check stages", newShipmentId);
        const stages = await Stage.where({ shipmentId: newShipmentId });
        expect(stages)
          .to.be.an("array")
          .to.have.lengthOf(1);

        expect(stages[0].dates.pickup.arrival).to.contain.keys(["planned"]);
        expect(stages[0].dates.delivery.arrival).to.contain.keys(["planned"]);
      });
    });
    describe("[shipment.update]", function() {
      beforeEach(async function() {
        await resetCollections(["shipments"]);
        return true;
      });
      const context = {
        accountId: ACCOUNT_ID,
        userId: USER_ID
      };
      it("throws an error when not logged in", async function() {
        let result;
        try {
          result = await resolvers.Mutation.updateShipment(null, {}, {});
        } catch (error) {
          result = error;
        }
        expect(result).to.be.an("error");
        expect(result.message).to.match(/not-authorized/);
      });
      it("allow shipment updates", async function() {
        const args = {
          shipmentId: SHIPMENT_ID,
          updates: {
            pickup: {
              location: {
                latLng: {
                  lat: 50.8888189,
                  lng: 4.458519900000056
                },
                timeZone: "Europe/Brussels",
                countryCode: "BE",
                zipCode: "1930",
                name: "Globex Belgium",
                addressId: "j958tYA872PAogTDq",
                address: {
                  street: "Leonardo da Vincilaan",
                  number: "7",
                  city: "Zaventem",
                  state: "Vlaanderen"
                }
              },
              date: "2017-10-19T00:00:00.000Z"
            }
          }
        };
        const updateShipment = await resolvers.Mutation.updateShipment(
          null,
          args,
          context
        );
        expect(updateShipment).to.not.equal(undefined);
        expect(updateShipment).to.be.an("object");
      });
    });
    describe("[shipment.cancel]", function() {
      beforeEach(async function() {
        await resetCollections(["shipments"]);
        return true;
      });
      const context = {
        accountId: ACCOUNT_ID,
        userId: USER_ID
      };
      it("throws an error when not logged in", async function() {
        let result;
        try {
          result = await resolvers.Mutation.cancelShipment(null, {}, {});
        } catch (error) {
          result = error;
        }
        expect(result).to.be.an("error");
        expect(result.message).to.match(/not-authorized/);
      });
      it("allow shipment cancel", async function() {
        const args = {
          shipmentId: SHIPMENT_ID
        };
        const cancelShipment = await resolvers.Mutation.cancelShipment(
          null,
          args,
          context
        );
        expect(cancelShipment).to.not.equal(undefined);
        expect(cancelShipment).to.be.an("object");
      });
    });
    describe("[shipment.uncancel]", function() {
      beforeEach(async function() {
        await resetCollections(["shipments"]);
        return true;
      });
      const context = {
        accountId: ACCOUNT_ID,
        userId: USER_ID
      };
      it("throws an error when not logged in", async function() {
        let result;
        try {
          result = await resolvers.Mutation.unCancelShipment(null, {}, {});
        } catch (error) {
          result = error;
        }
        expect(result).to.be.an("error");
        expect(result.message).to.match(/not-authorized/);
      });
      it.skip("allow shipment uncancel", async function() {
        const args = {
          shipmentId: SHIPMENT_ID
        };
        const uncancelShipment = await resolvers.Mutation.unCancelShipment(
          null,
          args,
          context
        );
        expect(uncancelShipment).to.not.equal(undefined);
        expect(uncancelShipment).to.be.an("object");
      });
    });
    describe("[confirmShipmentRequest]", function() {
      before(async function() {
        await resetCollections(["shipments"]);
        await Shipment._collection.update(
          { _id: SHIPMENT_ID },
          {
            $set: {
              request: {
                requestedOn: new Date(),
                by: USER_ID,
                accountId: ACCOUNT_ID,
                status: "draft"
              }
            }
          }
        );
      });
      const context = {
        accountId: ACCOUNT_ID,
        userId: USER_ID
      };

      it("[confirmShipmentRequest]", async function() {
        const args = {
          shipmentId: SHIPMENT_ID
        };
        const res = await resolvers.Mutation.confirmShipmentRequest(
          null,
          args,
          context
        );

        expect(res).to.not.equal(undefined);
        expect(res.id).to.equal(args.shipmentId);

        expect(res.request).to.not.equal(undefined);
        expect(res.request.submittedOn).to.not.equal(undefined);
        expect(res.request.submittedOn).to.be.a("date");
        expect(res.request.status).to.equal("submitted");
      });
    });
    describe("[query] gets shipment info", function() {
      const context = {
        accountId: ACCOUNT_ID,
        userId: USER_ID
      };
      before(async function() {
        await resetCollections(["shipments"]);
      });
      it("[getShipmentCostDetails] gets shipment costs with exchange rates", async function() {
        const args = { shipmentId: SHIPMENT_ID };
        const shipment = await resolvers.Query.getShipmentCostDetails(
          null,
          args,
          context
        );

        expect(shipment).to.not.equal(undefined);
        expect(shipment).to.be.an("object");
        expect(shipment.costs).to.be.an("array");
        expect(shipment.costs).to.have.lengthOf(3);
        expect(shipment.costs[0].calculatedExchange).to.equal(0.825488);
      });
    });
    describe("nestedItems field resolver", function() {
      let shipment = {};
      const SHIPMENT_ID_WITH_TWO_ITEMS = "2jG2mZFcaFzqaThcr";
      beforeEach(async function() {
        const nestedItems = await ShipmentItem.where({
          shipmentId: SHIPMENT_ID_WITH_TWO_ITEMS
        });
        shipment = {
          id: SHIPMENT_ID_WITH_TWO_ITEMS,
          nestedItems
        };
        return true;
      });
      it("filters out by types", function() {
        const filteredItems = resolvers.ShipmentAggr.nestedItems(shipment, {
          types: ["HU"]
        });
        expect(filteredItems).to.be.an("array");
        expect(filteredItems).to.have.lengthOf(1);
        expect(filteredItems[0].type).to.equal("HU");
      });
      it("filters out by depth", function() {
        const filteredItems = resolvers.ShipmentAggr.nestedItems(shipment, {
          depth: 1
        });

        expect(filteredItems).to.be.an("array");
        expect(filteredItems).to.have.lengthOf(1);
        expect(filteredItems[0].level).to.equal(0);
      });
      it("keeps all in if no filters set ", function() {
        const filteredItems = resolvers.ShipmentAggr.nestedItems(shipment, {});

        expect(filteredItems).to.be.an("array");
        expect(filteredItems).to.have.lengthOf(2);
      });
    });
    describe("[updateShipmentLocation] modifies from location", function() {
      const context = {
        accountId: ACCOUNT_ID,
        userId: USER_ID
      };
      beforeEach(function() {
        return resetCollections(["shipments", "stages", "locations"]);
      });
      it("[updateShipmentLocation][from] modifies from location", async function() {
        const args = {
          input: {
            shipmentId: SHIPMENT_ID,
            locationType: "pickup",
            updates: {
              city: "testCity",
              zipCode: "testZip",
              street: "testStreet",
              number: "123",
              name: "testName",
              phoneNumber: "testPhone",
              companyName: "testCompany"
            }
          }
        };
        const res = await resolvers.Mutation.updateShipmentLocation(
          null,
          args,
          context
        );

        // from location should have been updated in both shipment & stages
        expect(res.pickup.location).to.eql({
          latLng: { lat: 50.8888189, lng: 4.458519900000056 },
          countryCode: "BE",
          zipCode: "testZip",
          name: "testName",
          addressId: "j958tYA872PAogTDq",
          address: {
            street: "testStreet",
            number: "123",
            city: "testCity",
            state: "Vlaanderen"
          },
          timeZone: "Europe/Paris",
          companyName: "testCompany",
          phoneNumber: "testPhone"
        });

        expect(res.stages[0].from.address).to.eql({
          street: "testStreet",
          number: "123",
          city: "testCity",
          state: "Vlaanderen"
        });
      });
      it("[updateShipmentLocation][to] modifies to location", async function() {
        const args = {
          input: {
            shipmentId: SHIPMENT_ID,
            locationType: "delivery",
            updates: {
              city: "testCity",
              zipCode: "testZip",
              street: "testStreet",
              number: "123",
              name: "testName",
              phoneNumber: "testPhone",
              companyName: "testCompany"
            }
          }
        };
        const res = await resolvers.Mutation.updateShipmentLocation(
          null,
          args,
          context
        );

        // from location should have been updated in both shipment & stages
        expect(res.delivery.location).to.eql({
          latLng: { lat: 40.3061528, lng: -3.465709199999992 },
          countryCode: "ES",
          zipCode: "testZip",
          name: "testName",
          addressId: "WJNLceXYjFBdYL4YQ",
          address: {
            street: "testStreet",
            number: "123",
            city: "testCity",
            state: "Comunidad de Madrid"
          },
          timeZone: "Europe/Madrid",
          phoneNumber: "testPhone",
          email: "test@test.com",
          companyName: "testCompany"
        });

        expect(res.stages[0].to.address).to.eql({
          street: "testStreet",
          number: "123",
          city: "testCity",
          state: "Comunidad de Madrid"
        });
      });
    });
  });
  describe("security", function() {
    const context = {
      userId: USER_ID,
      accountId: ACCOUNT_ID
    };
    let shipment;
    before(async function() {
      shipment = await Shipment.first(SHIPMENT_ID);
    });
    it("[createShipment]allows creating a shipment when I am planner/admin", async function() {
      const test = new CheckShipmentSecurity({}, context);
      await test.getUserRoles();
      test.can({ action: "createShipment" });
      expect(test.check()).to.equal(true);
    });
    it("[updateShipment][draft]allows updating a shipment when I am planner/admin (own shipment)", async function() {
      const test = new CheckShipmentSecurity(
        {
          shipment: {
            ...shipment,
            status: "draft"
          }
        },
        context
      );
      await test.getUserRoles();
      test.can({ action: "updateShipment" });
      expect(test.check()).to.equal(true);
    });
    it("[updateShipment][planned]allows updating a shipment [notes, references, nonconformances] when I am planner/admin (own shipment)", async function() {
      const test = new CheckShipmentSecurity(
        {
          shipment: {
            ...shipment,
            status: "planned"
          }
        },
        context
      );
      await test.getUserRoles();
      test.can({
        action: "updateShipment",
        data: { notes: { booking: "test" } }
      });
      expect(test.check()).to.equal(true);
    });
    it("[archiveShipment]allows archiving shipment", async function() {
      const test = new CheckShipmentSecurity(
        {
          shipment: {
            ...shipment,
            status: "draft"
          }
        },
        context
      );
      await test.getUserRoles();
      test.can({ action: "archiveShipment" });
      expect(test.check()).to.equal(true);
    });

    it("[cancel]allows cancelling a shipment when I am planner/admin & shipment status is ['draft'] (own shipment)", async function() {
      const test = new CheckShipmentSecurity(
        {
          shipment: {
            ...shipment,
            status: "draft"
          }
        },
        context
      );
      await test.getUserRoles();
      test.can({ action: "cancelShipment" });
      expect(test.check()).to.equal(true);
    });
    it("[updateTags]allows updating tagsas owner", async function() {
      const test = new CheckShipmentSecurity(
        {
          shipment: {
            ...shipment,
            status: "started"
          }
        },
        context
      );
      await test.getUserRoles();
      test.can({ action: "updateTags" });
      expect(test.check()).to.equal(true);
    });
    it("[updateRequestedDates]allows updating tagsas owner", async function() {
      const test = new CheckShipmentSecurity(
        {
          shipment: {
            ...shipment,
            status: "draft"
          }
        },
        context
      );
      await test.getUserRoles();
      test.can({ action: "updateRequestedDates" });
      expect(test.check()).to.equal(true);
    });
    it("[select carrier]allows selecting a carrier for shipment in draft (own shipment)", async function() {
      const test = new CheckShipmentSecurity(
        {
          shipment: {
            ...shipment,
            status: "draft"
          }
        },
        context
      );
      await test.getUserRoles();
      test.can({ action: "selectCarrier" });
      expect(test.check()).to.equal(true);
    });
  });
});
