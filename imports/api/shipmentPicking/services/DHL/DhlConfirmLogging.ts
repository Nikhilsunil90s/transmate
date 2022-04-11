/* eslint-disable camelcase */
// @ts-nocheck : FIXME - TS giving errors here
import { Mongo } from "meteor/mongo";

import Model from "../../../Model";
import { DhlConfirmLoggingSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/dhl-confirm-logging";

class DhlConfirmLogging extends Model {}

DhlConfirmLogging._collection = new Mongo.Collection("dhl-confirm-logging");

DhlConfirmLogging._collection.attachSchema(DhlConfirmLoggingSchema);

DhlConfirmLogging._collection = DhlConfirmLogging.updateByAt(
  DhlConfirmLogging._collection
);

export { DhlConfirmLogging };
