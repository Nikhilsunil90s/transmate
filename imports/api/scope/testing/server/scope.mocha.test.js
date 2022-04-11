/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback, no-unused-vars */
import { Random } from "/imports/utils/functions/random.js";
import { bigQuery } from "@transmate-eu/bigquery_module_transmate";

// collections:
import { Tender } from "/imports/api/tenders/Tender";
import { TenderDetail } from "/imports/api/tenders/TenderDetail";

import { tenderDoc } from "/imports/api/tenders/testing/tenderDoc3";
import { tenderDetailDocs } from "/imports/api/tenders/testing/tenderDetailsDoc";

import { ScopeService } from "../../services/scopeService";
import { ScopeCopyService } from "/imports/api/scope/services/scopeCopyService";
import { ScopeDataService } from "/imports/api/scope/services/scopeDataService";

// output should match

import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection";
import { resolvers } from "../../apollo/resolvers";

const { expect } = require("chai");

let defaultMongo;

const ACCOUNT_ID = "S65957";
const USER_ID = "jsBor6o3uRBTFoRQY";
const TENDER_ID = "zx43GEoqXk66umzNS";
const PRICELIST_ID = "n8pYLq3LEzZDHqYS4";
const SIMULATION_ID = "HA9jM7Eqo4KWLDBne";

const TARGET_TENDER_ID = "snDYcbKWBaPCyWRbj";

describe("scope", function() {
  const accountId = ACCOUNT_ID;
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo.js");
      await defaultMongo.connect();
    }
    await resetDb({ resetUsers: true });
  });
  describe("for-tender", function() {
    beforeEach(async function() {
      await resetCollections(["tenders", "tenderDetails"]);
    });
    it("it generates the scope for a tender", async function() {
      const type = "tender";
      const documentId = TENDER_ID;
      const scope = await new ScopeService()
        .setCollections({ type, documentId })
        .scopeDef()
        .aggregate();

      expect(scope).to.have.lengthOf(16);
      expect(scope[0].laneId).to.equal("LCHoEc");
      expect(scope[0].volumeGroupId).to.equal("uZhkc4");
      expect(scope[0].volumeRangeId).to.equal("obsFDt");
    });
  });
  describe("copy", function() {
    beforeEach(async function() {
      await resetCollections(["tenders", "tenderDetails"]);
    });
    it("copies from a priceList Document", async function() {
      // create priceListDoc:

      const scope = new ScopeCopyService();
      await scope.getReferenceDoc({
        referenceId: PRICELIST_ID,
        referenceType: "priceList"
      });
      scope.copy();
      const newScope = scope.get();

      // test
      expect(newScope.lanes).to.have.lengthOf(4);
      expect(newScope.volumes).to.have.lengthOf(1);
      expect(newScope.lanes[0].id).to.equal("yEuMxg");
    });
    it("copies from a tender document", async function() {
      // e.g. from tenderDoc1 to tenderDoc 2...
      // this is used if you create a tender from a reference document first, you
      // then copy over the data from that reference document too...

      const scope = new ScopeCopyService();
      await scope.getReferenceDoc({
        referenceId: TENDER_ID,
        referenceType: "tender"
      });
      scope.copy();
      await scope.enrichScope();
      scope.checkNewScope();
      const res = scope.get();

      // test;

      expect(res.definition).to.eql(["DG", "volumes"]);
      expect(res.lanes).to.have.lengthOf(2);
      expect(res.lanes[0].id).to.equal("LCHoEc");
      expect(res.volumes).to.have.lengthOf(1);
      expect(res.volumes[0].ranges).to.have.lengthOf(4);
      expect(res.goodsDG).to.eql([true, false]);
    });
    it("copies from a simulation document", async function() {
      // e.g. from tenderDoc1 to tenderDoc 2...
      // this is used if you create a tender from a reference document first, you
      // then copy over the data from that reference document too...

      const scope = await new ScopeCopyService().getReferenceDoc({
        referenceId: SIMULATION_ID,
        referenceType: "simulation"
      });
      scope.copy();
      scope.enrichScope();
      scope.checkNewScope();
      const res = scope.get();

      expect(res.definition).to.eql(["equipments"]);
      expect(res.lanes).to.have.lengthOf(2);
      expect(res.lanes[0].id).to.equal("6cFkZ2");
      expect(res.equipments).to.have.lengthOf(1);
    });
    it("stores scope in tender doc", async function() {
      const scope = new ScopeCopyService();
      await scope.getReferenceDoc({
        referenceId: TENDER_ID,
        referenceType: "tender"
      });
      scope.copy();
      await scope.enrichScope();
      scope.checkNewScope();

      await scope.toMasterDoc({
        masterType: "tender",
        masterId: TARGET_TENDER_ID
      });

      // tests:
      const tender = await Tender.first(TARGET_TENDER_ID, {
        fields: { scope: 1 }
      });

      const res = tender.scope || {};

      expect(res.definition).to.eql(["DG", "volumes"]);
      expect(res.lanes).to.have.lengthOf(2);
      expect(res.lanes[0].id).to.equal("LCHoEc");
      expect(res.volumes).to.have.lengthOf(1);
      expect(res.volumes[0].ranges).to.have.lengthOf(4);
      expect(res.goodsDG).to.eql([true, false]);
    });
  });
  describe("data", function() {
    beforeEach(async function() {
      await resetCollections(["tenders", "tenderDetails"]);
    });
    it.skip("runs the bigquery data lookup", async function() {
      const scopeDef = {
        lanes: [
          {
            name: "France",
            id: "8nrdiz",
            from: {
              zones: [
                {
                  CC: "PT",
                  from: "*"
                }
              ]
            },
            to: {
              zones: [
                {
                  CC: "FR",
                  from: "*"
                }
              ]
            }
          }
        ],
        equipments: [
          {
            id: "z8C2qs",
            name: "P1",
            types: ["P/1"]
          },
          {
            name: "P2",
            types: ["P/2"],
            id: "dWAhzZ"
          },
          {
            id: "NFLCTt",
            name: "MA4",
            types: ["MA4"]
          }
        ],
        definition: ["equipments"],
        source: {
          type: "priceList",
          id: "mBx3mLbYarpGJNqLR"
        }
      };

      const data = (
        await bigQuery.getScope({ scopeDef, accountId: "S41452" })
      )[0];

      // this particular query returns an object with:
      expect(data.laneId).to.equal("8nrdiz");
      expect(data.equipmentId).to.equal("NFLCTt");
      expect(data.count).to.equal(26);
      expect(data.amount).to.equal(30);
      expect(data.leadTime).to.equal(0);
      expect(data.shipmentIds).to.have.lengthOf(26);
    });
    it("[from query] stores the scope groups in the details collection", async function() {
      // note: we are manually overriding the data step from Big query here:

      // tenderDoc
      const tender = await Tender._collection
        .rawCollection()
        .insertOne(tenderDoc);
      expect(tender.result).to.be.an("object");
      const masterId = tenderDoc._id;
      const masterType = "tender";
      const dbData = [
        {
          laneId: "CG5THg",
          volumeGroupId: null,
          volumeRangeId: null,
          equipmentId: null,
          goodsDG: true,
          count: 10,
          amount: 100,
          leadTime: 1000,
          shipmentIds: ["test1"]
        },
        {
          laneId: "CG5THg",
          volumeGroupId: null,
          volumeRangeId: null,
          equipmentId: null,
          goodsDG: false,
          count: 20,
          amount: 200,
          leadTime: 2000,
          shipmentIds: ["test2"]
        }
      ];

      let scopeData = await new ScopeDataService().getMasterDoc({
        masterId,
        masterType
      });
      expect(scopeData.masterDoc).to.be.an("object");
      expect(scopeData.masterDoc._id).to.be.an("string");
      scopeData = await scopeData.getScopeItems();

      scopeData = scopeData.set({ dbData }); // would be the dbSearch step...
      scopeData = await scopeData.mapDbData();
      scopeData = await scopeData.resetDetails();
      scopeData = await scopeData.saveToDetailsCollection();

      const res = await TenderDetail.where({ tenderId: masterId });

      // const res2 = TenderDetail.all();
      // console.dir({ res, res2 }, { depth: null });
      await expect(res).to.have.lengthOf(2);
      await expect(res[0].laneId).to.equal("CG5THg");

      // other tests here...
    });
    it("[generate data] stores the scope groups in the details collection", async function() {
      // note: we are manually overriding the data step from Big query here:

      // tenderDoc
      const tenderId = await Tender._collection.insert(tenderDoc);
      const masterId = tenderId;
      const masterType = "tender";

      let scopeData = await new ScopeDataService().getMasterDoc({
        masterId,
        masterType
      });
      scopeData = await scopeData.getScopeItems();
      scopeData = await scopeData.dataFill();
      const data = await scopeData.get("data");

      // test if we have data:
      // debug(scopeData.data);
      // debug(TenderDetail.all());
      expect(data).to.have.lengthOf(2);
      scopeData = await scopeData.resetDetails();
      await scopeData.saveToDetailsCollection();

      const res = await TenderDetail.where({ tenderId });
      expect(res).to.have.lengthOf(2);
      expect(res[0].quantity).to.have.keys(["count", "amount", "equipment"]);
    });
    it("[copy referenced data] stores the scope groups in the details collection", async function() {
      // note: we are manually overriding the data step from Big query here:

      const referenceId = Random.id();

      // to be copied tenderDetail docs:
      await Promise.all(
        tenderDetailDocs.map(doc =>
          TenderDetail._collection.insert({ ...doc, tenderId: referenceId })
        )
      );

      // tenderDoc
      tenderDoc.scope.source = { type: "tender", referenceId };
      const tenderId = await Tender._collection.insert(tenderDoc);

      const masterId = tenderId;
      const masterType = "tender";

      const scopeData = await new ScopeDataService().getMasterDoc({
        masterId,
        masterType
      });

      expect(scopeData.masterDoc).to.not.equal(undefined);

      await scopeData.copyDetailItems();

      await scopeData.resetDetails();
      await scopeData.saveToDetailsCollection();

      // console.dir(result, { depth: null });
      const res = await TenderDetail.where({ tenderId });
      expect(res).to.have.lengthOf(2);
      expect(res[0].quantity).to.have.keys([
        "count",
        "amount",
        "equipment",
        "currentCost",
        "leadTime"
      ]);
    });
  });
  describe("resolvers", function() {
    const context = { accountId: ACCOUNT_ID, userId: USER_ID };
    beforeEach(async function() {
      await resetCollections(["tenders", "tenderDetails"]);
    });
    it("copyScope", async function() {
      const args = {
        input: {
          referenceId: PRICELIST_ID,
          referenceType: "priceList",
          masterType: "tender",
          masterId: TARGET_TENDER_ID
        }
      };
      const res = await resolvers.Mutation.copyScope(null, args, context);
      expect(res).to.not.equal(undefined);
      expect(res).to.be.an("object");
      expect(res.definition).to.be.an("array");
    });
    it("scopeDataFromSource", async function() {
      // only valid for tender and simulation !!
      // when copying from pricelist, there is no volume data attached!!
      const args = {
        input: {
          masterType: "tender",
          masterId: TARGET_TENDER_ID
        }
      };

      await TenderDetail._collection.remove({ tenderId: TARGET_TENDER_ID });
      await Tender._collection.update(
        { _id: TARGET_TENDER_ID },
        {
          $set: {
            "scope.source": {
              type: "tender",
              referenceId: "zx43GEoqXk66umzNS"
            }
          }
        }
      );

      // document should have  scope > source > referenceId field

      const res = await resolvers.Mutation.scopeDataFromSource(
        null,
        args,
        context
      );
      expect(res).to.not.equal(undefined);
      expect(res).to.be.an("object");

      const count = await TenderDetail.count({ tenderId: TARGET_TENDER_ID });
      expect(count).to.equal(16);
    });
    it("scopeGenerateDataFill", async function() {
      const args = {
        input: {
          masterType: "tender",
          masterId: TARGET_TENDER_ID
        }
      };
      const res = await resolvers.Mutation.scopeGenerateDataFill(
        null,
        args,
        context
      );
      expect(res).to.not.equal(undefined);
      expect(res).to.be.an("object");
    });
  });
});
