import { Mongo } from "meteor/mongo";

import Model from "../Model.js";

import { CostSchema } from "../_jsonSchemas/simple-schemas/collections/costs.js";

class Cost extends Model {}

Cost._collection = new Mongo.Collection("costs");

Cost._collection.attachSchema(CostSchema);
Cost._collection = Cost.updateByAt(Cost._collection);
export { Cost };
