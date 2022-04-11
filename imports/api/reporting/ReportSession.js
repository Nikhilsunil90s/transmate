/* eslint-disable camelcase */
import { Mongo } from "meteor/mongo";
import moment from "moment";
import Model from "../Model";

import { ReportSessionSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/report-session";

class ReportSession extends Model {
  static before_create(obj) {
    const newObj = obj;
    if (!newObj.expires)
      newObj.expires = moment()
        .add(1, "hour")
        .toDate();

    return newObj;
  }
}

ReportSession._collection = new Mongo.Collection("report.sessions", {
  idGeneration: "MONGO"
});

ReportSession._collection.attachSchema(ReportSessionSchema);
ReportSession._collection = ReportSession.updateByAt(ReportSession._collection);
export { ReportSession };
