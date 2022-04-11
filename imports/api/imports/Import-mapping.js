import { Mongo } from "meteor/mongo";
import Model from "../Model";

class ImportMapping extends Model {}

ImportMapping._collection = new Mongo.Collection("edi_mapping");
ImportMapping._collection = ImportMapping.updateByAt(ImportMapping._collection);
export { ImportMapping };
