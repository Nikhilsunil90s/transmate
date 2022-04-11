import { Mongo } from "meteor/mongo";
import Model from "../Model.js";
import { InvoiceSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/invoice.js";
import { ByAtSchema } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/_all.js";

class Invoice extends Model {
  // eslint-disable-next-line camelcase
  static before_save(obj) {
    obj.updated = ByAtSchema.clean({});
    return obj;
  }
}

Invoice._collection = new Mongo.Collection("invoices");

Invoice._collection.attachSchema(InvoiceSchema);
Invoice._collection = Invoice.updateByAt(Invoice._collection);
export { Invoice };
