/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */
import { expect } from "chai";

// methods/ fn
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb";
import { DataImportProcess } from "../../services/dataImportProcess";
import { DataImportAddress } from "../../services/dataImportWorker-address";
import { DataImportInvoiceLines } from "../../services/dataImportWorker-invoiceLines";

// set the userId when invoking methods:
import { EdiJobs } from "../../../jobs/Jobs";
import { Address } from "../../../addresses/Address";
import { addressDocs } from "../../../addresses/testing/addressDocs";
import { invoiceDoc } from "/imports/api/invoices/testing/data.invoice";
import { Shipment } from "/imports/api/shipments/Shipment";
import { Invoice } from "/imports/api/invoices/Invoice";
import { InvoiceItem } from "/imports/api/invoices/Invoice-item";

import { generateShipmentData } from "/imports/api/shipments/testing/data/shipmentTestData";

import {
  csvUploadData as csvDataAddress,
  workersDocuments as workerDocsAddress
} from "../import-address-data.json";
import { csvUploadData as csvDataInvoice } from "../import-invoice-data.json";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection";

const USER_ID = "jsBor6o3uRBTFoRQY";
const ACCOUNT_ID = "S56205";
const CARRIER_ID = "C11051";

let defaultMongo;
describe("data-import-worker", function() {
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo");
      await defaultMongo.connect();
    }

    const resetDone = await resetDb({ resetUsers: true });
    if (!resetDone) throw Error("reset was not possible, test can not run!");
  });
  describe("worker - address import", function() {
    let addressId; // dummy address that represents the validated address
    before(function() {
      // add some data in the db:
      const addressDoc = addressDocs[0];
      addressId = addressDoc._id;
      return Address._collection.insert(addressDoc);
    });
    it("starts the data import process", async function() {
      // process is called with type and data (== csv file parsed)

      // initialize class
      const processor = new DataImportProcess({
        userId: USER_ID,
        accountId: ACCOUNT_ID,
        type: "address"
      });

      expect(processor.type).to.equal("address");

      // intialize dataImport
      await processor.dbInit({ data: csvDataAddress });
      expect(processor.importDocId).to.not.equal(undefined);

      const importDocId = processor.get();

      // setup worker jobs:
      await processor.initiateProcess();
      const cursor = await EdiJobs.find({ "data.importId": importDocId });
      const workers = await cursor.fetch();

      expect(workers).to.have.lengthOf(
        3,
        "3 worker docs should have been created"
      );
      expect(workers[0].data.importId).to.equal(importDocId);
    });
    it("runs the jobs", async function() {
      // this function gets called by method (importData-address) & runs the job
      const { importId, data } = workerDocsAddress[0].data;
      const job = new DataImportAddress({
        userId: USER_ID,
        accountId: ACCOUNT_ID,
        importId
      });

      // data is coming from jobs.data
      job.initData({ data });
      expect(job.data).to.be.a("object");

      job.validate();
      expect(job.isValid).to.equal(true);

      // doesn't do anything at the moment
      job.transform();

      // does the remote call:
      // this inserts an address in the collection and returns the id
      // await job.validateAddress();
      // it then sets:
      job.addressId = addressId;

      // job.addToAddressBook();
      // Address.first(addressId)

      // job.anotate();
      // const { addressId, name, warnings } = job.get();
    });
  });

  describe("worker - invoice import", function() {
    let invoiceId;
    beforeEach(async function() {
      await resetCollections(["shipments", "stages", "items", "invoices"]);

      // add some data in the db:
      const invoice = {
        ...invoiceDoc,
        creatorId: ACCOUNT_ID,
        clientId: ACCOUNT_ID
      };
      invoiceId = await Invoice._collection.insert(invoice);

      // it will try to match this shipment:
      const shipment = generateShipmentData({
        accountId: ACCOUNT_ID,
        shipperId: ACCOUNT_ID,
        carrierId: CARRIER_ID
      });
      shipment.number = "MATCHING";
      await Shipment._collection.insert(shipment);
      return true;
    });
    it("starts the data import process", async function() {
      // process is called with type and data (== csv file parsed)
      // initialize class
      const processor = new DataImportProcess({
        userId: USER_ID,
        accountId: ACCOUNT_ID,
        references: { invoiceId },
        type: "invoice"
      });

      expect(processor.type).to.equal("invoice");

      // intialize dataImport
      await processor.dbInit({ data: csvDataInvoice });

      const importId = processor.get();
      expect(importId).to.not.equal(undefined);

      // setup worker jobs:
      await processor.initiateProcess();
      const cursor = await EdiJobs.find({ "data.importId": importId });
      const workers = await cursor.fetch();

      expect(workers).to.have.lengthOf(
        3,
        "3 worker docs should have been created"
      );
      expect(workers[0].data.importId).to.equal(importId);
    });

    // FIXME: solve this test!!
    it.skip("runs the jobs", async function() {
      let testError;

      // simulation of what the worker would do for each worker document
      // 0. prepare data:
      const processor = new DataImportProcess({
        userId: USER_ID,
        accountId: ACCOUNT_ID,
        references: { invoiceId },
        type: "invoice"
      });

      await processor.dbInit({ data: csvDataInvoice });
      await processor.initiateProcess();

      const importId = processor.get();

      const cursor = await EdiJobs.find({ "data.importId": importId });
      const workers = await cursor.fetch();
      expect(workers).to.have.lengthOf(
        3,
        "3 worker docs should have been created"
      );
      async function runWorkerService(workerData) {
        const {
          data,
          importId: docImportId,
          userId,
          accountId: docAccountId,
          references
        } = workerData;

        const job = new DataImportInvoiceLines({
          accountId: docAccountId,
          userId,
          importId: docImportId
        });

        // data is coming from jobs.data
        job.initData({ data, references });
        expect(job.data).to.be.a("object", "data object stored in job");

        await job.getInvoiceDoc();
        expect(job.invoice).to.be.a("object", "invoice should be found");
        expect(job.invoice.id).to.not.equal(null);

        await job.matchShipment(); // throws error if not found!
        expect(job.shipmentId).to.not.equal(null);

        job.matchCost();
        expect(job.costs).to.be.an("array");

        await job.parseInvoiceLine();

        const { shipmentId } = job.get();
        return shipmentId;
      }

      // first one matches:
      let matchedShipmentId;
      try {
        matchedShipmentId = await runWorkerService(workers[0].data);
      } catch (err) {
        testError = err;
      }
      expect(testError).to.not.be.an(
        "error",
        `first item should match, but sends error :${(testError || {}).message}`
      );
      expect(matchedShipmentId).to.not.equal(undefined);

      const generatedItem = await InvoiceItem.first({
        shipmentId: matchedShipmentId,
        invoiceId
      });

      expect(generatedItem).to.not.equal(undefined);

      expect(generatedItem.costs).to.have.lengthOf(1);
      expect(generatedItem.costs[0].amount).to.not.equal(undefined);

      // second item does not match and throws an error
      testError = null;
      try {
        await runWorkerService(workers[1].data);
      } catch (err) {
        testError = err;
      }
      expect(testError).to.be.an("error");
      expect(testError.message).to.match(
        /Reference did not return any matching shipments/
      );

      // 3rd one matches & adds a 2nd cost to the costs array in the itemdoc:
      let newMatchedShipmentId;
      testError = null;
      try {
        newMatchedShipmentId = await runWorkerService(workers[2].data);
      } catch (err) {
        testError = err;
      }
      expect(testError).to.not.be.an("error", "third item should match");
      const generatedItem2 = await InvoiceItem.first({
        shipmentId: newMatchedShipmentId,
        invoiceId
      });

      expect(generatedItem2).to.not.equal(undefined);

      expect(generatedItem2.costs).to.have.lengthOf(2);
      expect(generatedItem2.costs[1].amount).to.not.equal(undefined);
    });
  });
});
