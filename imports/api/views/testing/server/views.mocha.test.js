/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
import { expect } from "chai";
import { Meteor } from "meteor/meteor";
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection";
import { resolvers } from "../../apollo/resolvers";

const ACCOUNT_ID = "S65957";
const USER_ID = "jsBor6o3uRBTFoRQY";
const SHIPMENT_VIEW_ID = "Hqsf7JEYAwzuXMRg7";

let defaultMongo;
describe("shipments async", function() {
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
  describe("resolvers", function() {
    describe("upsert shipment view", function() {
      before(async function() {
        await resetCollections(["shipments"]);
      });
      const context = {
        accountId: ACCOUNT_ID,
        userId: USER_ID
      };
      it.skip("[upsertShipmentView]", async function() {
        const args = {
          input: {
            viewId: SHIPMENT_VIEW_ID,
            asNew: false,
            data: {
              shipmentOverviewType: "mongo"
            }
          }
        };
        const res = await resolvers.Mutation.upsertShipmentView(
          null,
          args,
          context
        );
        expect(res).to.not.equal(undefined);
        expect(res.id).to.equal(args.input.viewId);
        expect(res.shipmentOverviewType).to.equal(
          args.input.data.shipmentOverviewType
        );
      });
    });
    describe("remove shipment view", function() {
      before(async function() {
        await resetCollections(["shipments", "accounts", "users"]);
      });
      const context = {
        accountId: ACCOUNT_ID,
        userId: USER_ID
      };
      it.skip("[removeShipmentView]", async function() {
        const args = {
          viewId: SHIPMENT_VIEW_ID
        };
        const res = await resolvers.Mutation.removeShipmentView(
          null,
          args,
          context
        );
        expect(res).to.not.equal(undefined);
        expect(res).to.be.a("boolean");
        expect(res).to.equal.tp(true);
      });
    });
  });
});
