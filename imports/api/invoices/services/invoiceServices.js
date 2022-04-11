import get from "lodash.get";
import { Invoice } from "/imports/api/invoices/Invoice";
import { InvoiceItem } from "/imports/api/invoices/Invoice-item";
import { Shipment } from "/imports/api/shipments/Shipment";

const debug = require("debug")("invoice:service");

export const invoiceService = ({ accountId, userId }) => ({
  accountId,
  userId,
  init({ invoiceId }) {
    this.invoiceId = invoiceId;
    return this;
  },

  /**
   * @param {{partnerId:string, number?:string, date:Date, role:string }} param0
   * @returns
   */
  async create({ partnerId, number, date, role }) {
    const data = {
      creatorId: this.accountId,
      number,
      date,
      created: { by: this.userId, at: new Date() }
    };

    if (role === "vendor") {
      // I am the vendor
      data.sellerId = this.accountId;
      data.clientId = partnerId;
    } else {
      // the other one is the vendor
      data.sellerId = partnerId;
      data.clientId = this.accountId;
    }

    this.invoice = await Invoice.create_async(data);
    return this;
  },
  invoiceCostAddedToShipment: ({ shipmentId, index }) => {
    return InvoiceItem._collection.update(
      { invoiceId: this.invoiceId, shipmentId },
      { $set: { [`costs.${index}.addedToShipment`]: true } }
    );
  },
  async resetCostMappings() {
    // method to look through invoice items and set all used cost description in costs array of invoice
    // this can then be used to remap.
    // if the upload went well, this would not be needed
    const aggr = await InvoiceItem.aggregate([
      { $match: { invoiceId: this.invoiceId } },
      { $unwind: "$costs" },
      { $sort: { "costs.description": 1 } },
      {
        $group: {
          _id: "$invoiceId",
          costs: {
            $addToSet: {
              description: "$costs.description",
              code: "$costs.code",
              costId: "$costs.costId"
            }
          }
        }
      }
    ]);

    const costItems = get(aggr, [0, "costs"]);
    await Invoice._collection.update(
      { _id: this.invoiceId },
      { $set: { costs: costItems } }
    );
    return costItems;
  },
  async updateMappings({ newMappings = [] }) {
    let res;
    const errors = [];
    if (newMappings.length > 0) {
      // bulk operation would have been nice, but the driver does not allow $arrayFilters:
      const collection = InvoiceItem._collection.rawCollection();

      try {
        await Promise.all(
          newMappings.map(async ({ description, costId }) => {
            debug({ description, costId });
            const { result } = await collection.update(
              { invoiceId: this.invoiceId },
              { $set: { "costs.$[obj].costId": costId } },
              {
                arrayFilters: [{ "obj.description": { $eq: description } }],
                multi: true,
                bypassCollection2: true
              }
            );

            debug({ result });
          })
        );
      } catch (err) {
        errors.push(err);
        console.error(err);
      }
    }
    return res;
  },
  async setShipmentInvoiceFlag({ shipmentId }) {
    if (!shipmentId) return;
    await Shipment._collection.update(
      { _id: shipmentId },
      { $addToSet: { flags: "has-invoice" } }
    );
  },

  // flags per item if it has been added or not:
  async setShipmentCostItemInvoiceFlag({ item }) {
    const costItemIds = (item.costs || []).map(({ id }) => id);
    await Shipment._collection.update(
      { _id: item.id, "costs.id": { $in: costItemIds } },
      {
        $set: {
          "costs.$[].invoiced": true,
          "costs.$[].invoiceId": this.invoiceId
        }
      },
      { bypassCollection2: true }
    );
  },

  async parseInvoiceItem({ item }) {
    await InvoiceItem._collection.upsert(
      {
        invoiceId: this.invoiceId,
        shipmentId: item.id
      },
      {
        $addToSet: { costs: { $each: item.costs } },
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
  },

  async processShipmentItems({ items = [] }) {
    const promises = [];
    items.forEach(item => {
      promises.push(this.parseInvoiceItem({ item }));
      promises.push(this.setShipmentCostItemInvoiceFlag({ item }));
      promises.push(this.setShipmentInvoiceFlag({ shipmentId: item.id }));
    });
    await Promise.all(promises);

    return this;
  },

  async calculateInvoiceTotal() {
    const items = await InvoiceItem.where(
      { invoiceId: this.invoiceId },
      { fields: { costs: 1 } }
    );

    const total = items.reduce((accTotal, curItem) => {
      const subTotal = (curItem.costs || []).reduce((acc, cur) => {
        return (
          get(cur, ["amount", "value"], 0) * get(cur, ["amount", "rate"], 1) +
          acc
        );
      }, 0);
      return subTotal + accTotal;
    }, 0);

    await Invoice._collection.update(
      { _id: this.invoiceId },
      { $set: { "amount.value": total } }
    );

    return this;
  },
  getUIResponse() {
    if (!this.invoice) {
      return Invoice.first(this.invoiceId);
    }
    return this.invoice;
  }
});
