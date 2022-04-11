import { Mongo } from "meteor/mongo";
import { AccountPortalSchema } from "../_jsonSchemas/simple-schemas/collections/accountPortal";

import Model from "../Model";

class AccountPortal extends Model {}

AccountPortal._collection = new Mongo.Collection("account.portal");

AccountPortal._collection.attachSchema(AccountPortalSchema);
AccountPortal._collection = AccountPortal.updateByAt(AccountPortal._collection);
export { AccountPortal };
