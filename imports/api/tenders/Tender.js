/* eslint-disable camelcase */
import { Mongo } from "meteor/mongo";
import moment from "moment";
import Model from "../Model";
import { TenderSchema } from "../_jsonSchemas/simple-schemas/collections/tender";
import { ByAtSchema } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/_all";
import { generateUniqueNumber } from "/imports/utils/server/generateUniqueNumber";

const debug = require("debug")("collection:tender");

class Tender extends Model {
  static async create_async(attr) {
    attr.number = await generateUniqueNumber(this, 6);
    return super.create_async(attr);
  }

  static before_create(obj) {
    delete obj.createdAt;

    return obj;
  }

  // eslint-disable-next-line camelcase
  static before_save(obj) {
    debug("update on tender %j", obj);
    obj.updated = ByAtSchema.clean({});
    return obj;
  }

  isClosed() {
    return moment().format("YYYY-MM-DD") > this.closeDate;
  }
}

Tender._collection = new Mongo.Collection("tenders");

Tender._collection.attachSchema(TenderSchema);
Tender._collection = Tender.updateByAt(Tender._collection);

export { Tender };
