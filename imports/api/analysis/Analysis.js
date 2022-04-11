/* eslint-disable camelcase */
import { Mongo } from "meteor/mongo";
import Model from "../Model";
import { AnalysisSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/analysis";
import { ByAtSchema } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/_all";

class Analysis extends Model {
  static before_create(obj) {
    delete obj.createdAt;
    obj.created = ByAtSchema.clean({});

    obj.progress = {
      data: 0,
      process: 0,
      aggregate: 0
    };
    return obj;
  }
}

Analysis._collection = new Mongo.Collection("analyses");

Analysis._collection.attachSchema(AnalysisSchema);
Analysis._collection = Analysis.updateByAt(Analysis._collection);

export { Analysis };
