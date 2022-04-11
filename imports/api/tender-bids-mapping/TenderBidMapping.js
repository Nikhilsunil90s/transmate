import { Mongo } from "meteor/mongo";
import Model from "../Model";

// import { TenderBidSchema } from "../_jsonSchemas/simple-schemas/collections/tender-bid";

class TenderBidMapping extends Model {}

TenderBidMapping._collection = new Mongo.Collection("tenders.bids.mapping");

export { TenderBidMapping };
