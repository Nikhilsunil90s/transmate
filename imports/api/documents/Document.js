/* eslint-disable camelcase */
import { Mongo } from "meteor/mongo";
import startsWith from "underscore.string/startsWith";

import Model from "../Model.js";
import { Shipment } from "/imports/api/shipments/Shipment.js";
import { DocumentSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/document.js";
import { s3url } from "/imports/utils/functions/s3url.js";
import { ByAtSchema } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/_all";

class Document extends Model {
  static create(attr, validate = true) {
    if (validate) {
      return super.create(attr);
    }
    const id = this._collection.insert(attr, {
      validate: false
    });
    return this.after_create(this.first(id));
  }

  static async create_async(attr, validate = true) {
    if (validate) {
      return super.create_async(attr);
    }

    const id = await this._collection.insert(attr, {
      validate: false
    });
    return this.first(id);
  }

  // eslint-disable-next-line camelcase
  static before_create(obj) {
    delete obj.createdAt;
    obj.created = obj.created || ByAtSchema.clean({});
    return obj;
  }

  shipment() {
    return Shipment.first(this.shipmentId);
  }

  // eslint-disable-next-line consistent-return
  url() {
    if (this.store.service === "s3") {
      return s3url(this.store);
    }
  }

  icon() {
    if (this.meta.type === "application/pdf") {
      return "file pdf outline";
    }
    if (startsWith(this.meta.type, "image/")) {
      return "file image outline";
    }
    return "file outline";
  }

  static typeIcon(type) {
    if (type === "application/pdf") {
      return "file pdf outline";
    }
    if (startsWith(type, "image/")) {
      return "file image outline";
    }
    if (
      type === "application/vnd.ms-excel" ||
      type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      return "file excel outline";
    }
    return "file outline";
  }
}

Document._collection = new Mongo.Collection("documents");

Document._collection.attachSchema(DocumentSchema);
Document._collection = Document.updateByAt(Document._collection);
export { Document };
