import { Mongo } from "meteor/mongo";
import Model from "../Model.js";

const debug = require("debug")("template:db");

class DocTemplate extends Model {
  static get({ name, accountId }) {
    debug("get data for %o", { name, accountId });
    return this._collection.findOne(
      {
        name,
        $or: [{ accountId }, { accountId: { $exists: false } }]
      },
      { sort: { accountId: -1, "updated.at": -1 } } // this will show the custom template first
    );
  }
}

DocTemplate._collection = new Mongo.Collection("templates");
DocTemplate._collection = DocTemplate.updateByAt(DocTemplate._collection);
export { DocTemplate };
