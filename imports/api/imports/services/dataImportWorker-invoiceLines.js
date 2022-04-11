import get from "lodash.get";

import { Shipment } from "/imports/api/shipments/Shipment";
import { Invoice } from "/imports/api/invoices/Invoice";
import { InvoiceItem } from "/imports/api/invoices/Invoice-item";

import { invoiceService } from "/imports/api/invoices/services/invoiceServices";

// import schema from "../../.jsonSchemas/restAPI/imports-partners.json";

const DUMMY_COST_ID = "JpKrR3PggDfp8dnNP";

const debug = require("debug")("imports:invoiceLines");

// schema of data element:
// "shipment.number", // maps to shipment.number
// "shipment.shipperRef", // maps to references
// "shipment.carrierRef", // mapts to references
// "costs.0.amount.value",
// "costs.0.amount.currency",
// "costs.0.amount.convValue",
// "costs.0.amount.rate",
// "costs.0.amount.currencyDate",
// "costs.0.description",
// "costs.0.code",
// "costs.0.costId"

class DataImportInvoiceLines {
  constructor({ accountId, userId, importId }) {
    this.accountId = accountId;
    this.userId = userId;
    this.importId = importId;
    this.warnings = [];
    return this;
  }

  initData({ data, references = {} }) {
    this.data = data;
    this.references = references;
    debug("data initialized");
    return this;
  }

  async getInvoiceDoc() {
    const { invoiceId } = this.references;
    if (!invoiceId) throw new Error("missing data, invoiceId should be passed");
    this.invoice = await Invoice.first(invoiceId, {
      fields: { accountId: 1, sellerId: 1, clientId: 1 }
    });
    return this;
  }

  async matchShipment() {
    const shipmentNumber = get(this.data, ["shipment", "number"]); // maps to shipment.number
    const shipperRef = get(this.data, ["shipment", "shipperRef"]); // maps to references
    const carrierRef = get(this.data, ["shipment", "carrierRef"]); // mapts to references

    if (!(shipmentNumber || shipperRef || carrierRef))
      throw new Error("missing reference, Add at least one shipment reference");

    const shipments = await Shipment.where(
      {
        $and: [
          {
            $or: [
              { accountId: this.invoice.clientId },
              { shipperId: this.invoice.shipperId }
            ]
          },
          {
            $or: [
              ...(shipmentNumber ? [{ number: shipmentNumber }] : []),
              ...(!shipmentNumber && shipperRef
                ? [{ "references.number": shipperRef }]
                : []),
              ...(!shipmentNumber && carrierRef
                ? [{ "references.carrier": carrierRef }]
                : [])
            ]
          }
        ]
      },
      { fields: { _id: 1, number: 1 } }
    );

    const count = (shipments && shipments.length) || 0;

    if (count === 0)
      throw new Error("Reference did not return any matching shipments");

    if (count > 1)
      throw new Error(
        `Reference returned multiple shipments (${shipments
          .map(({ number }) => number)
          .join(", ")})`
      );

    this.shipmentId = shipments[0]._id;

    return this;
  }

  matchCost() {
    this.costs = get(this.data, "costs", []).map(
      ({ description, code, ...cost }) => {
        // TODO [#283]: do something smart with the description and code here...

        return {
          ...cost,
          description,
          code,
          costId: DUMMY_COST_ID
        };
      }
    );

    return this;
  }

  async parseInvoiceLine() {
    // we assume the cost description is unique in the invoice:
    // is this solid enough? addToSet will compare the entire object...
    await InvoiceItem._collection.upsert(
      {
        invoiceId: this.invoice._id,
        shipmentId: this.shipmentId
      },
      {
        $addToSet: { costs: { $each: this.costs } },
        $setOnInsert: {
          created: {
            by: this.userId,
            at: new Date()
          },
          deleted: false
        }
      }
    );

    return this;
  }

  async setShipmentFlag() {
    await invoiceService()
      .init({ invoiceId: this.invoiceId })
      .setShipmentInvoiceFlag({
        shipmentId: this.shipmentId
      });
    return this;
  }

  get() {
    return {
      shipmentId: this.shipmentId,
      warnings: this.warnings
    };
  }
}

export { DataImportInvoiceLines };
