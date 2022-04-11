import { Mongo } from "meteor/mongo";
import Model from "../Model";
import { Invoice } from "/imports/api/invoices/Invoice";
import { InvoiceItemSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/invoice-item";
import { ByAtSchema } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/_all";

class InvoiceItem extends Model {
  // eslint-disable-next-line camelcase
  static before_create(obj) {
    delete obj.createdAt;
    if (!obj.created) {
      obj.created = ByAtSchema.clean({});
    }
    return obj;
  }

  // eslint-disable-next-line camelcase
  static before_save(obj) {
    obj.updated = ByAtSchema.clean({});
    return obj;
  }

  // optional turn on : trigger refresh of main invoice report sync from item udpate
  // eslint-disable-next-line camelcase, consistent-return
  static after_save(obj) {
    const invoice = obj.invoiceId && Invoice.first(obj.invoiceId);
    if (invoice) {
      return invoice.update({
        updated: ByAtSchema.clean({})
      });
    }
  }
}

InvoiceItem._collection = new Mongo.Collection("invoices.items");

InvoiceItem._collection.attachSchema(InvoiceItemSchema);
InvoiceItem._collection = InvoiceItem.updateByAt(InvoiceItem._collection);

export { InvoiceItem };
