import { Mongo } from "meteor/mongo";
import Model from "../Model";

// import { TenderBidSchema } from "../_jsonSchemas/simple-schemas/collections/tender-bid";
// import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
// import { ByAtSchema } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/_all";

// const debug = require("debug")("Tenderify:collection");

class TenderBidData extends Model {}

TenderBidData._collection = new Mongo.Collection("tenders.bids.data", {
  idGeneration: "MONGO"
});

// TenderBid._collection = TenderBid.updateByAt(TenderBid._collection);

export { TenderBidData };
