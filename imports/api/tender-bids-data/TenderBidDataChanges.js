import { Mongo } from "meteor/mongo";
import Model from "../Model";

class TenderBidDataChanges extends Model {}

TenderBidDataChanges._collection = new Mongo.Collection(
  "tenders.bids.data.changes",
  { idGeneration: "MONGO" }
);

export { TenderBidDataChanges };
