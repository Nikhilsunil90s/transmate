import { Mongo } from "meteor/mongo";
import { CronLoggingSchema } from "../_jsonSchemas/simple-schemas/collections/cron-logging";
import Model from "../Model";
import { COLLECTION_NAME } from "./constants";

export class CronLogging extends Model {}

const collectionName = `${COLLECTION_NAME}.logging`;
CronLogging._collection = new Mongo.Collection(collectionName);

CronLogging._collection.attachSchema(CronLoggingSchema);

// make sure to expire logging after 2 weeks = 1209600 seconds;

CronLogging._collection.createIndex(
  { time: -1 },
  {
    expireAfterSeconds: 1209600,
    background: true
  }
);
