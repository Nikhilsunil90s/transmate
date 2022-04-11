/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
import { Meteor } from "meteor/meteor";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection";
import { expect } from "chai";
import { resolvers } from "../../apollo/resolvers";

const ACCOUNT_ID = "S65957";
const USER_ID = "jsBor6o3uRBTFoRQY";
const SHIPMENT_WITHOUT_NC = "Liy2zt3cqqymTKtfj";
const NON_CONFORMANCE_ID = "rts96uuL9eTHJiPoG";

let defaultMongo;
describe("nonConformances", function() {
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo");
      await defaultMongo.connect();
    }

    const resetDone = await resetCollections([
      "accounts",
      "users",
      "roles",
      "roleAssingments"
    ]);
    if (!resetDone) throw Error("reset was not possible, test can not run!");
    Meteor.setUserId && Meteor.setUserId(USER_ID);
  });

  describe("resolvers", function() {
    const context = { accountId: ACCOUNT_ID, userId: USER_ID };
    beforeEach(async function() {
      return resetCollections(["shipments", "nonConformances"]);
    });
    it("[addNonConformance] adds a non-conformance", async function() {
      const args = {
        shipmentId: SHIPMENT_WITHOUT_NC,
        data: {
          id: null,
          comment: "test",
          created: { by: USER_ID, at: 1629103872234 },
          date: 1629093600000,
          reasonCode: { event: "EQ", reason: "1", owner: "H", occurance: "B" }
        }
      };
      const res = await resolvers.Mutation.addNonConformance(
        null,
        args,
        context
      );

      expect(res).to.not.equal(undefined);
      expect(res.nonConformances).to.be.an("array");
      expect(res.nonConformances).to.have.lengthOf(1);
      expect(res.nonConformances[0].shipmentId).to.equal(SHIPMENT_WITHOUT_NC);
      expect(res.nonConformances[0].reasonCode).to.eql(args.data.reasonCode);
      expect(res.nonConformances[0].comment).to.equal(args.data.comment);
    });
    it("[updateNonConformance] updates a non-conformance", async function() {
      const args = {
        id: NON_CONFORMANCE_ID,
        update: {
          comment: "test",
          created: { by: USER_ID, at: 1629103872234 },
          date: 1629093600000,
          reasonCode: { event: "SH", reason: "1", owner: "H", occurance: "B" }
        }
      };

      const res = await resolvers.Mutation.updateNonConformance(
        null,
        args,
        context
      );

      expect(res).to.not.equal(undefined);
      expect(res.nonConformances).to.be.an("array");
      expect(res.nonConformances).to.have.lengthOf(2);

      const nonConformance = res.nonConformances.find(
        ({ id }) => id === NON_CONFORMANCE_ID
      );
      expect(nonConformance).to.not.equal(undefined);
      expect(nonConformance.reasonCode.event).to.equal(
        args.update.reasonCode.event
      );
    });
    it("[deleteNonConformance] removes a non-conformance", async function() {
      const args = {
        id: NON_CONFORMANCE_ID
      };

      const res = await resolvers.Mutation.deleteNonConformance(
        null,
        args,
        context
      );

      expect(res).to.not.equal(undefined);
      expect(res.nonConformances).to.be.an("array");
      expect(res.nonConformances).to.have.lengthOf(1);
    });
  });
});
