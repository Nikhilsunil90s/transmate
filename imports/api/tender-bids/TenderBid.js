/* eslint-disable camelcase */
import { Mongo } from "meteor/mongo";

import moment from "moment";
import Model from "../Model";

import { ByAtSchema } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/_all.js";
import { TenderBidSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/tender-bid";
import { generateUniqueNumber } from "/imports/utils/functions/generateUniqueNumber";

const debug = require("debug")("collection:tender");

class TenderBid extends Model {
  static async create_async(attr, validate = true) {
    attr.number = await generateUniqueNumber();

    if (validate) {
      return super.create_async(attr);
    }

    const docId = await this._collection.insert(attr, {
      validate: false
    });
    return this.first(docId);
  }

  static before_save(obj) {
    debug("update on tender %j", obj);
    obj.updated = ByAtSchema.clean({});
    return obj;
  }

  isClosed() {
    return moment().format("YYYY-MM-DD") > this.closeDate;
  }
}

TenderBid._collection = new Mongo.Collection("tenders.bids");

TenderBid._collection.attachSchema(TenderBidSchema);

// TenderBid._collection = TenderBid.updateByAt(TenderBid._collection);

export { TenderBid };
