/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
import { Meteor } from "meteor/meteor";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection";
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { expect } from "chai";

import { resolvers } from "../../apollo/resolvers";
import { Import } from "../../Import-shipments";
import { EdiRows } from "../../Import-shipments-rows";
import { importService } from "../../services/_importService";

const ACCOUNT_ID = "S65957";
const USER_ID = "jsBor6o3uRBTFoRQY";
const IMPORT_ID = "gnZJPjwG9z3rJvuXX";
const IMPORT_ID_W_MAPPING = "gnZJPjwG9z3rJvuCy";

let defaultMongo;
describe("import-shipment", function() {
  const context = {
    accountId: ACCOUNT_ID,
    userId: USER_ID
  };
  before(async function() {
    Meteor.setUserId && Meteor.setUserId(context.userId);
  });
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo");
      await defaultMongo.connect();
    }

    const resetDone = await resetDb({ resetUsers: true });
    if (!resetDone) throw Error("reset was not possible, test can not run!");
  });
  describe("[create]import creation", function() {
    it("[create]throws an error when not logged in", async function() {
      let testError;
      try {
        await resolvers.Mutation.createShipmentImport(null, {}, {});
      } catch (error) {
        testError = error;
      }
      expect(testError).to.be.an("error");
      expect(testError.message).to.match(/not-authorized/);
    });
    it("[create]creates document", async function() {
      const res = await resolvers.Mutation.createShipmentImport(
        null,
        {},
        context
      );

      expect(res).to.not.equal(undefined);
      expect(res.id).to.not.equal(undefined);
      const importDoc = await Import.first(res.id);
      expect(importDoc).to.not.equal(undefined);
      expect(importDoc.accountId).to.equal(context.accountId);
    });
  });
  describe("[init mapping] initializes mapping", function() {
    beforeEach(async function() {
      await resetCollections(["shipmentImport"]);
      await Import._collection.update(
        { _id: IMPORT_ID },
        {
          $set: {
            progress: {
              data: 100,
              lookup: 0,
              mapping: 0,
              jobs: 0,
              process: 0
            }
          }
        }
      );
    });
    it("[init mapping]throws an error when not logged in", async function() {
      let testError;
      try {
        await resolvers.Mutation.initializeShipmentImportMapping(
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
    it("[init mapping]creates mapping data in db", async function() {
      const res = await resolvers.Mutation.initializeShipmentImportMapping(
        null,
        { input: { importId: IMPORT_ID } },
        context
      );

      expect(res).to.not.equal(undefined);
      expect(res.id).to.not.equal(undefined);
      expect(res.mapping).to.not.equal(undefined);
      expect(res.mapping.headers).to.be.an("object");
      expect(res.mapping.values).to.be.an("object");
    });
  });
  describe("[data upload]import rows", function() {
    beforeEach(async function() {
      await EdiRows.remove({});
    });
    it("[insertShipmentImportRow]throws an error when not logged in", async function() {
      let testError;
      try {
        await resolvers.Mutation.insertShipmentImportRow(
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
    it("[insertShipmentImportRow] data row, no header", async function() {
      const input = {
        importId: IMPORT_ID,
        i: 0,
        data: {
          arrival_date: "2020-02-12",
          base: "test",
          carrierId: "C12456",
          category: "Some text",
          cost: 1200,
          currency: "EUR",
          departure_date: "2020-02-12",
          from_country: "Belgium",
          from_postal_code: "2600",
          ftl: true,
          milkrun: false,
          shipment: "123456789",
          to_country: "FR",
          to_postal_code: "12000",
          transport_mode: "road"
        },
        headers: null,
        progress: 1
      };

      await resolvers.Mutation.insertShipmentImportRow(
        null,
        { input },
        context
      );
      const cursor = await EdiRows.find({});
      const rows = await cursor.fetch();
      expect(rows).to.not.equal(undefined);
      expect(rows).to.have.lengthOf(1);
    });
    it("[insertShipmentImportRow] data row, with header update", async function() {
      const NEW_HEADERS = ["A", "B", "C"];
      const input = {
        importId: IMPORT_ID,
        i: 0,
        data: {
          arrival_date: "2020-02-12",
          base: "test",
          carrierId: "C12456",
          category: "Some text",
          cost: 1200,
          currency: "EUR",
          departure_date: "2020-02-12",
          from_country: "Belgium",
          from_postal_code: "2600",
          ftl: true,
          milkrun: false,
          shipment: "123456789",
          to_country: "FR",
          to_postal_code: "12000",
          transport_mode: "road"
        },
        headers: NEW_HEADERS,
        progress: 1
      };

      await resolvers.Mutation.insertShipmentImportRow(
        null,
        { input },
        context
      );
      const cursor = await EdiRows.find({});
      const rows = await cursor.fetch();
      expect(rows).to.not.equal(undefined);
      expect(rows).to.have.lengthOf(1);

      const imp = await Import.first(IMPORT_ID);
      expect(imp.headers).to.eql(NEW_HEADERS);
    });
    it("[importDoneShipmentImport] throws an error when not logged in", async function() {
      let testError;
      try {
        await resolvers.Mutation.importDoneShipmentImport(null, {}, {});
      } catch (error) {
        testError = error;
      }
      expect(testError).to.be.an("error");
      expect(testError.message).to.match(/not-authorized/);
    });
    it("[importDoneShipmentImport] data upload flagged done", async function() {
      const res = await resolvers.Mutation.importDoneShipmentImport(
        null,
        { importId: IMPORT_ID },
        context
      );

      expect(res).to.not.equal(undefined);
      expect(res.progress.data).to.equal(100);
    });
  });
  describe("[cancel import]import", function() {
    beforeEach(async function() {
      await EdiRows.remove({});
    });
    it("[cancelShipmentImport]throws an error when not logged in", async function() {
      let testError;
      try {
        await resolvers.Mutation.cancelShipmentImport(null, {}, {});
      } catch (error) {
        testError = error;
      }
      expect(testError).to.be.an("error");
      expect(testError.message).to.match(/not-authorized/);
    });
    it.skip("[cancelShipmentImport] cancels import", async function() {
      const res = await resolvers.Mutation.cancelShipmentImport(
        null,
        { importId: IMPORT_ID },
        context
      );
    });
  });
  describe("[revert import]import", function() {
    beforeEach(async function() {
      await EdiRows.remove({});
    });
    it("[revertShipmentImport]throws an error when not logged in", async function() {
      let testError;
      try {
        await resolvers.Mutation.revertShipmentImport(null, {}, {});
      } catch (error) {
        testError = error;
      }
      expect(testError).to.be.an("error");
      expect(testError.message).to.match(/not-authorized/);
    });
    it.skip("[revertShipmentImport] cancels import", async function() {
      const res = await resolvers.Mutation.revertShipmentImport(
        null,
        { importId: IMPORT_ID },
        context
      );
    });
  });
  describe("[restart import]import", function() {
    beforeEach(async function() {
      await EdiRows.remove({});
    });
    it("[restartShipmentImport]throws an error when not logged in", async function() {
      let result;
      try {
        result = await resolvers.Mutation.restartShipmentImport(null, {}, {});
      } catch (error) {
        result = error;
      }
      expect(result).to.be.an("error");
      expect(result.message).to.match(/not-authorized/);
    });

    // function not working
    it.skip("[restartShipmentImport] restart import", async function() {
      const args = {
        importId: IMPORT_ID
      };
      const res = await resolvers.Mutation.restartShipmentImport(
        null,
        args,
        context
      );
    });
  });
  describe("[process import]import", function() {
    beforeEach(async function() {
      await EdiRows.remove({});
    });
    it("[processShipmentImport]throws an error when not logged in", async function() {
      let result;
      try {
        result = await resolvers.Mutation.processShipmentImport(null, {}, {});
      } catch (error) {
        result = error;
      }
      expect(result).to.be.an("error");
      expect(result.message).to.match(/not-authorized/);
    });

    // function not working
    it("[processShipmentImport] restart import", async function() {
      const args = {
        importId: IMPORT_ID
      };
      const res = await resolvers.Mutation.processShipmentImport(
        null,
        args,
        context
      );
      expect(res).to.not.equal(undefined);
      expect(res).to.be.a("string");
    });
  });
  describe("mapping", function() {
    beforeEach(async function() {
      await resetCollections(["shipmentImport"]);
    });
    it("[mapShipmentImportHeader]throws an error when not logged in", async function() {
      let testError;
      try {
        await resolvers.Mutation.mapShipmentImportHeader(
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
    it("[mapShipmentImportHeader] maps header field", async function() {
      const HEADER = "shipment";
      const KEY = "shipment.references.number";
      const input = {
        importId: IMPORT_ID,
        header: HEADER,
        key: KEY
      };
      const res = await resolvers.Mutation.mapShipmentImportHeader(
        null,
        { input },
        context
      );

      expect(res.mapping.headers[HEADER]).to.equal(KEY);
    });
    it("[mapShipmentImportHeader] throws error when mapping 2x same key", async function() {
      const HEADER = "shipment";
      const KEY = "shipment.references.number";
      const input = {
        importId: IMPORT_ID,
        header: HEADER,
        key: KEY
      };
      await resolvers.Mutation.mapShipmentImportHeader(
        null,
        { input },
        context
      );

      try {
        await resolvers.Mutation.mapShipmentImportHeader(
          null,
          { input },
          context
        );
      } catch (error) {
        expect(error).to.be.an("error");
        expect(error.message).to.match(/mapping-error/);
      }
    });
    it("[mapShipmentImportValue]throws an error when not logged in", async function() {
      let testError;
      try {
        await resolvers.Mutation.mapShipmentImportValue(
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
    it("[mapShipmentImportValue] maps value field", async function() {
      const HEADER = "mode";
      const ORIGINAL_VALUE = "baantransport";
      const SYSTEM_VALUE = "road";
      const input = {
        importId: IMPORT_ID,
        header: HEADER,
        importValue: ORIGINAL_VALUE,
        systemValue: SYSTEM_VALUE
      };
      await resolvers.Mutation.mapShipmentImportValue(null, { input }, context);

      const imp = await Import.first(IMPORT_ID);
      expect(imp.mapping.values[HEADER][ORIGINAL_VALUE]).to.equal(SYSTEM_VALUE);
    });
  });

  describe("validation", function() {
    beforeEach(function() {
      return resetCollections(["shipmentImport", "shipmentImportRows"]);
    });
    it("validation errors: missing key field 'to' ", async function() {
      // case: missing key fields
      // make to fields missing in stage:
      await Import._collection.update(
        { _id: IMPORT_ID_W_MAPPING },
        {
          $set: {
            "mapping.headers.to_country": "ignore",
            "mapping.headers.to_postal_code": "ignore"
          }
        }
      );

      const imp = await Import.first(IMPORT_ID_W_MAPPING);
      const srv = importService(context);
      await srv.init({ imp });
      await srv.checkValidationErrors();

      const { errors } = srv;
      expect(errors).to.be.an("array");
      expect(errors).to.have.lengthOf(1);
      expect(errors[0]).to.eql({
        error: "missingMap",
        message: "please add mapping to field: stage.to"
      });
    });
    it("validation errors: missing key field 'references.number' ", async function() {
      // case: missing key fields
      // make to fields missing in stage:
      await Import._collection.update(
        { _id: IMPORT_ID_W_MAPPING },
        {
          $set: { "mapping.headers.shipment": "ignore" }
        }
      );

      const imp = await Import.first(IMPORT_ID_W_MAPPING);
      const srv = importService(context);
      await srv.init({ imp });
      await srv.checkValidationErrors();

      const { errors } = srv;
      expect(errors).to.be.an("array");
      expect(errors).to.have.lengthOf(1);
      expect(errors[0]).to.eql({
        error: "missingMap",
        message: "please add mapping to field: shipment.references.number"
      });
    });
    it("validation errors: json validation failure -missing date fields", async function() {
      // case: missing key fields
      // make to fields missing in stage:
      // we are removing the dates fields
      await Import._collection.update(
        { _id: IMPORT_ID_W_MAPPING },
        {
          $set: { "mapping.headers.departure_date": "ignore" }
        }
      );

      const imp = await Import.first(IMPORT_ID_W_MAPPING);
      const srv = importService(context);
      await srv.init({ imp });
      await srv.checkValidationErrors();

      const { errors } = srv;
      expect(errors).to.be.an("array");
      expect(errors).to.have.lengthOf(1);
      expect(errors[0]).to.eql({
        error: "mapping",
        message:
          "Shipment data should have required property 'delivery' on ->stages[0]->dates"
      });
    });
    it("validation errors: date format", async function() {
      // case: missing key fields
      // update first row to make the date wrong format:
      await EdiRows.update(
        { importId: IMPORT_ID_W_MAPPING },
        { $set: { "data.departure_date": "01/01/2010" } },
        { multi: true }
      );

      const imp = await Import.first(IMPORT_ID_W_MAPPING);
      const srv = importService(context);
      await srv.init({ imp });
      await srv.checkValidationErrors();

      const { errors } = srv;
      expect(errors).to.be.an("array");
      expect(errors).to.have.lengthOf(2);
      expect(errors[0].message).to.match(/Date was not recognized/i);
    });
    it("validation errors: pass a valid doc", async function() {
      const imp = await Import.first(IMPORT_ID_W_MAPPING);
      const srv = importService(context);
      await srv.init({ imp });
      await srv.checkValidationErrors();

      const { errors } = srv;
      expect(errors).to.be.an("array");
      expect(errors).to.have.lengthOf(0);
    });
  });
});
