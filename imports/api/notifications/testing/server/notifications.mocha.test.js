/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
import { Meteor } from "meteor/meteor";

import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection";
import { expect } from "chai";
import { resolvers } from "../../apollo/resolvers";

// const debug = require("debug")("tenderify:test");

const ACCOUNT_ID = "S65957";
const USER_ID = "jsBor6o3uRBTFoRQY";

let defaultMongo;
describe("notifications", function() {
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
      "notifications"
    ]);
    if (!resetDone) throw Error("reset was not possible, test can not run!");
    Meteor.setUserId && Meteor.setUserId(USER_ID);
  });
  describe("resolvers", function() {
    const context = { accountId: ACCOUNT_ID, userId: USER_ID };
    it("[getNotifications] gets notifications", async function() {
      const res = await resolvers.Query.getNotifications(null, null, context);
      expect(res).to.have.lengthOf(9);
    });
    it("[removeNotifications] removes notifications", async function() {
      const args = { ids: ["yWXvEDyA86TsDYpeW", "zntrcLdTXDg8cbTtg"] };
      await resolvers.Mutation.removeNotifications(null, args, context);

      const res = await resolvers.Query.getNotifications(null, null, context);
      expect(res).to.have.lengthOf(7);
    });
    it("[markNotificationsRead] marks notifications as read", async function() {
      const args = {
        input: {
          type: "shipment",
          events: ["canceled", "pickupAlert"],
          data: { shipmentId: "2jG2mZFcaFzqaThcr" }
        }
      };
      await resolvers.Mutation.markNotificationsRead(null, args, context);

      const res = await resolvers.Query.getNotifications(null, null, context);
      const shouldBeRead = res.find(({ id }) => id === "zZmGgqE2fJk9oQK7y");
      expect(shouldBeRead.read).to.not.equal(undefined);
    });
  });
});
