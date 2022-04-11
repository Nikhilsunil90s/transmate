/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
import { Meteor } from "meteor/meteor";
import pick from "lodash.pick";
import faker from "faker";

// import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection";
import { expect } from "chai";
import { resolvers } from "../../apollo/resolvers";
import { InvoiceItem } from "../../Invoice-item";
import { Shipment } from "../../../shipments/Shipment";

// const debug = require("debug")("tenderify:test");

const ACCOUNT_ID = "S65957";
const USER_ID = "jsBor6o3uRBTFoRQY";

const INVOICE_ID = "GSvTS5mw4rDxfJzuT";

let defaultMongo;
describe("invoice", function() {
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo");
      await defaultMongo.connect();
    }

    const resetDone = await resetCollections([
      "users",
      "accounts",
      "roles",
      "roleAssingments",
      "invoices",
      "invoiceItems"
    ]);
    if (!resetDone) throw Error("reset was not possible, test can not run!");
    Meteor.setUserId && Meteor.setUserId(USER_ID);
  });
  describe("resolvers", function() {
    const context = { accountId: ACCOUNT_ID, userId: USER_ID };
    beforeEach(async function() {
      const resetDone = await resetCollections([
        "invoices",
        "invoiceItems",
        "shipments"
      ]);
      return resetDone;
    });
    it("[createInvoice] allows to create an invoice", async function() {
      const args = {
        input: {
          partnerId: "C123456",
          number: faker.lorem.word(),
          date: new Date(),
          role: "customer"
        }
      };
      const createdInvoice = await resolvers.Mutation.createInvoice(
        null,
        args,
        context
      );

      // check the client and seller:
      expect(createdInvoice).to.not.equal(undefined);
      expect(createdInvoice.creatorId).to.equal(context.accountId);
      expect(createdInvoice.sellerId).to.equal(args.input.partnerId);
      expect(createdInvoice.clientId).to.equal(context.accountId);
    });
    it("[createInvoice] throws when not logged in", async function() {
      let errorTest;
      try {
        const args = { input: {} };
        await resolvers.Mutation.createInvoice(null, args, {});
      } catch (error) {
        errorTest = error;
      }
      expect(errorTest).to.be.an("error");
      expect(errorTest.message).to.match(/not-authorized/);
    });
    it("[getShipmentsWithoutInvoice] finds the uninvoiced shipments", async function() {
      const SHIPMENT_ID = "Liy2zt3cqqymTKtfj";
      await Shipment._collection.update(
        { _id: SHIPMENT_ID },
        { $set: { status: "completed", accountId: ACCOUNT_ID } },
        { $pull: { flags: "has-invoice" } }
      );
      const args = { invoiceId: INVOICE_ID };
      const availableItems = await resolvers.Query.getShipmentsWithoutInvoice(
        null,
        args,
        context
      );

      expect(availableItems).to.be.an("array");
      expect(availableItems.length).to.not.equal(0);
      expect(availableItems[0].id).to.equal(SHIPMENT_ID);
    });
    it("[addShipmentCostItems] allows to add the shipment items", async function() {
      const invoiceId = INVOICE_ID;
      const SHIPMENT_ID = "Liy2zt3cqqymTKtfj";
      await Shipment._collection.update(
        { _id: SHIPMENT_ID },
        { $set: { status: "completed", accountId: ACCOUNT_ID } },
        { $pull: { flags: "has-invoice" } }
      );

      const availableItems = await resolvers.Query.getShipmentsWithoutInvoice(
        null,
        { invoiceId: INVOICE_ID },
        context
      );

      expect(availableItems.length).to.not.equal(0);

      const items = availableItems.map(({ _id, costs }) => ({
        id: _id, // shipmentId
        costs: costs.map(cost =>
          pick(cost, ["id", "description", "amount", "costId", "accountId"])
        )
      }));

      const shipmentIds = availableItems.map(({ id }) => id);

      await resolvers.Mutation.addShipmentCostItems(
        null,
        { input: { invoiceId, items } },
        context
      );

      // tests:
      const invoiceItems = await InvoiceItem.where({ invoiceId });

      expect(invoiceItems).to.have.lengthOf(1);
      invoiceItems.forEach(item => {
        expect(item.shipmentId).to.be.oneOf(shipmentIds);
        expect(item.costs).to.have.lengthOf(6);
      });

      const shipments = await Shipment.where(
        { _id: { $in: shipmentIds } },
        { fields: { costs: 1, flags: 1 } }
      );

      shipments.forEach(shipment => {
        expect(shipment.flags).to.eql(["has-costs", "has-invoice"]);
        expect(shipment.costs[0].invoiceId).to.equal(invoiceId);
        expect(shipment.costs[1].invoiceId).to.equal(invoiceId);
      });
    });
    it("[recalculateInvoiceTotal]re-calculates the invoice total", async function() {
      const args = { invoiceId: INVOICE_ID };
      const updatedInvoice = await resolvers.Mutation.recalculateInvoiceTotal(
        null,
        args,
        context
      );

      expect(updatedInvoice.amount.value).to.equal(845.5463280332236);
    });
  });
});
