/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
import { Meteor } from "meteor/meteor";
import get from "lodash.get";

// import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection";
import { expect } from "chai";
import { resolvers } from "../../apollo/resolvers";

import { editTenderBidMapping } from "../../services/mutation.editTenderBidMapping";

const debug = require("debug")("tenderBid:test");

const ACCOUNT_ID = "S65957";
const USER_ID = "jsBor6o3uRBTFoRQY";

const TENDERBID_ID = "ekLwjhFL2haYJpjXw";
const TENDERBID_MAPPING_ID = "ekLwjhFL2haYJpjLL";
const TENDER_BID_ID = "ekLwjhFL2haYJpjXw";

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
    describe("[editTenderBidMapping]update Mapping", function() {
      beforeEach(async function() {
        const resetDone = await resetCollections([
          "tenderBid",
          "tenderBidMapping",
          "tenderBidData",
          "tenderBidMeta"
        ]);
        return resetDone;
      });
      it("throws an error when not logged in", async function() {
        try {
          await resolvers.Mutation.editTenderBidMapping(
            null,
            { input: {} },
            {}
          );
        } catch (error) {
          expect(error).to.be.an("error");
          expect(error.message).to.match(/not-authorized/);
        }
      });
      it("allows updating a mapping when logged in", async function() {
        const MAPPING_V = {
          key: "lanes",
          originId: 0,
          colKey: "target_lanesFromCountry",
          value: "FR"
        };

        const MAPPING_F = {
          key: "lanesFromCountry",
          original: "Belgium",
          target: "FR",
          store: "file"
        };
        const input = {
          mappingId: TENDERBID_MAPPING_ID,
          mappingV: {
            key: MAPPING_V.key,
            updates: [
              {
                originId: MAPPING_V.originId,
                colKey: MAPPING_V.colKey,
                value: MAPPING_V.value
              }
            ]
          },
          mappingF: {
            [MAPPING_F.key]: [
              {
                o: MAPPING_F.original,
                t: MAPPING_F.target,
                store: MAPPING_F.store
              }
            ]
          }
        };
        const updatedTenderBidMap = await resolvers.Mutation.editTenderBidMapping(
          null,
          { input },
          context
        );

        expect(updatedTenderBidMap).to.not.equal(undefined);
        expect(updatedTenderBidMap).to.be.an("object");

        // mappingV -> should have been been updated:
        // mappingV.lanes.data.index.col
        // `mappingV.${key}.data.${index}.${col}`
        const vUpdate = get(updatedTenderBidMap, [
          "mappingV",
          MAPPING_V.key,
          "data",
          MAPPING_V.originId
        ]);

        expect(vUpdate).to.not.equal(undefined);
        expect(vUpdate).to.be.an("object");

        // item that has been updated should be:
        expect(vUpdate[MAPPING_V.colKey]).to.equal(MAPPING_V.value);
        expect(vUpdate.updated).to.equal(true);

        // mappingF -> should:
        // lookup the mappingFunction or key related to the field (in this case "country")
        // add the mapping to that mappingKey
        const fUpdate = get(updatedTenderBidMap, ["mappingF"]);

        expect(fUpdate).to.not.equal(undefined);
        expect(fUpdate).to.be.an("object");
        expect(fUpdate.country).to.not.equal(undefined);
        expect(fUpdate.country).to.be.an("array");
        expect(fUpdate.country[0]).to.be.eql({
          o: "Belgium",
          t: "FR",
          store: "file"
        });
      });
    });

    describe("[generateTenderBidMapping]", function() {
      beforeEach(async function() {
        const resetDone = await resetCollections([
          "tenderBid",
          "tenderBidMapping",
          "tenderBidData",
          "tenderBidMeta"
        ]);
        return resetDone;
      });
      it("throws an error when not logged in", async function() {
        let errorTest;
        try {
          await resolvers.Mutation.generateTenderBidMapping(
            null,
            { input: {} },
            {}
          );
        } catch (error) {
          errorTest = error;
        }
        expect(errorTest).to.be.an("error");
        expect(errorTest.message).to.match(/not-authorized/);
      });
    });

    describe("[generateTenderBidSheet]", function() {
      beforeEach(async function() {
        const resetDone = await resetCollections([
          "tenderBid",
          "tenderBidMapping",
          "tenderBidData",
          "tenderBidMeta"
        ]);
        return resetDone;
      });
      it("throws an error when not logged in", async function() {
        let result;
        try {
          await resolvers.Mutation.generateTenderBidSheet(
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

      it("throws an error when tenderId not set", async function() {
        let result;
        try {
          await resolvers.Mutation.generateTenderBidSheet(
            null,
            { tenderBidId: null },
            context
          );
        } catch (error) {
          console.error(error);
          result = error;
        }

        expect(result).to.be.an("error");
        expect(result.message).to.match(/TenderBidId not set/);
      });

      it("genererate sheet cloud", async function() {
        let result;
        try {
          debug("start with ", { tenderBidId: TENDERBID_ID });
          result = await resolvers.Mutation.generateTenderBidSheet(
            null,
            { tenderBidId: TENDERBID_ID },
            context
          );
        } catch (error) {
          result = error;
        }

        expect(result).to.eql(true);
      });
    });

    describe("[duplicateTenderBidMappingRow]update Mapping", function() {
      beforeEach(async function() {
        const resetDone = await resetCollections([
          "tenderBid",
          "tenderBidMapping",
          "tenderBidData",
          "tenderBidMeta"
        ]);
        return resetDone;
      });
      it("throws an error when not logged in", async function() {
        try {
          await resolvers.Mutation.duplicateTenderBidMappingRow(
            null,
            { input: {} },
            {}
          );
        } catch (error) {
          expect(error).to.be.an("error");
          expect(error.message).to.match(/not-authorized/);
        }
      });
      it("allows updating a mapping when logged in", async function() {
        const input = {
          mappingId: TENDERBID_MAPPING_ID,
          topic: "lanes",
          originId: 2
        };
        const res = await resolvers.Mutation.duplicateTenderBidMappingRow(
          null,
          { input },
          context
        );

        const vUpdate = get(res, ["mappingV", input.topic, "data"]);
        const insertedItem = vUpdate[input.originId + 1];
        expect(insertedItem).to.eql({
          originId: 3,
          origin_lanesFromCountry: "TR",
          target_lanesFromCountry: null,
          origin_lanesFromCity: "Istanbul, Bosphorus (Istanbul) Strait",
          target_lanesFromCity: null,
          origin_lanesToCountry: "NL",
          target_lanesToCountry: null,
          origin_lanesToCity: "Best",
          target_lanesToCity: null,
          targetId: null,
          validated: false,
          warnings: []
        });
      });
    });
    describe("[addTenderBidMapping]", function() {
      beforeEach(async function() {
        const resetDone = await resetCollections([
          "tenderBid",
          "tenderBidMapping",
          "tenderBidData",
          "tenderBidMeta"
        ]);
        return resetDone;
      });
      it("add tender bid mapping", async function() {
        const args = {
          input: {
            tenderBidId: TENDER_BID_ID,
            mapping: {
              fileId: "5QBqC",
              fileType:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              name: "tenderify demo with conversion v02 road.xlsx"
            }
          }
        };
        const res = await resolvers.Mutation.addTenderBidMapping(
          null,
          args,
          context
        );
        expect(res).to.not.equal(undefined);
        expect(res).to.be.an("object");
      });
    });
    describe("[removeTenderBidMapping]", function() {
      beforeEach(async function() {
        const resetDone = await resetCollections([
          "tenderBid",
          "tenderBidMapping",
          "tenderBidData",
          "tenderBidMeta"
        ]);
        return resetDone;
      });
      it("removeTenderBidMapping", async function() {
        const args = {
          mappingId: TENDERBID_MAPPING_ID
        };
        const res = await resolvers.Mutation.removeTenderBidMapping(
          null,
          args,
          context
        );
        expect(res).to.not.equal(undefined);
        expect(res).to.be.an("object");
      });
    });
    describe("[generateTenderBidMapping]", function() {
      beforeEach(async function() {
        const resetDone = await resetCollections([
          "tenderBid",
          "tenderBidMapping",
          "tenderBidData",
          "tenderBidMeta"
        ]);
        return resetDone;
      });
      it.skip("generateTenderBidMapping", async function() {
        const args = {
          mappingId: TENDERBID_MAPPING_ID
        };
        const res = await resolvers.Mutation.generateTenderBidMapping(
          null,
          args,
          context
        );
        console.log(res);
        expect(res).to.not.equal(undefined);
        expect(res).to.be.an("object");
      });
    });
    describe("[generateTenderBidSheet]", function() {
      beforeEach(async function() {
        const resetDone = await resetCollections([
          "tenderBid",
          "tenderBidMapping",
          "tenderBidData",
          "tenderBidMeta"
        ]);
        return resetDone;
      });
      it("generateTenderBidSheet", async function() {
        const args = {
          tenderBidId: TENDER_BID_ID
        };
        const res = await resolvers.Mutation.generateTenderBidSheet(
          null,
          args,
          context
        );
        expect(res).to.not.equal(undefined);
        expect(res).to.be.a("Boolean");
        expect(res).to.equal(true);
      });
    });
  });
  describe("services", function() {
    const context = { accountId: ACCOUNT_ID, userId: USER_ID };
    it("[update][headermap] updates headermap", function() {
      // headerUpdate = {"10": {origin:{}, target:{}, updated: true}}
      const headerUpdate = {
        "1": {
          origin: "Load Trade",
          target: "Test"
        }
      };
      const { dbUpdate } = editTenderBidMapping(context).updateHeaderMap(
        headerUpdate
      );

      expect(dbUpdate).to.eql({
        "mappingH.1": { origin: "Load Trade", target: "Test", updated: true }
      });
    });
    it("[update][updateValueMap] updates mappingV", function() {
      // mappingupdate = { key, updates: [{index, prop, value}]}
      const update = {
        key: "lanes",
        updates: [
          {
            originId: 0,
            colKey: "target.lanesFromCountry",
            value: "FR"
          }
        ]
      };

      const srv = editTenderBidMapping(context).updateValueMap(update);

      const { dbUpdate } = srv;
      expect(dbUpdate).to.eql({
        "mappingV.lanes.data.0.target.lanesFromCountry": "FR",
        "mappingV.lanes.data.0.updated": true
      });
    });
    it("[update][updateFieldMap] updates mappingF", function() {
      // mappingF update: { <key> : [ {o: <>, t:<>, store:"file"}]}

      const fieldMap = {
        lanesFromCountry: [{ o: "Belgium", t: "FR", store: "file" }]
      };

      const srv = editTenderBidMapping(context).updateFieldMap(fieldMap);

      const { dbUpdate } = srv;
      expect(dbUpdate).to.eql({
        "mappingF.lanesFromCountry": [{ o: "Belgium", t: "FR", store: "file" }]
      });
    });
    it.skip("[update][updateFieldMap] updates mappingV based on new mappingF", function() {
      // mappingF update: { <key> : [ {o: <>, t:<>, store:"file"}]}
      const fieldMap = {
        lanesFromCountry: [{ o: "Belgium", t: "FR", store: "file" }]
      };

      const res = editTenderBidMapping(context)
        .updateFieldMap(fieldMap)
        .runPostActions();
      console.log(res);

      // TODO [$6130a08837762e00094fd3da]: post actions would update the mappingV
      // to verify the code there and reinstall tests here.
    });
  });
});
