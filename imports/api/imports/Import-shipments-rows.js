import { Mongo } from "meteor/mongo";
import { ImportShipmentRowSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/import-shipments-rows.js";

const EdiRows = new Mongo.Collection("edi_rows");

EdiRows.attachSchema(ImportShipmentRowSchema);

export { EdiRows };
