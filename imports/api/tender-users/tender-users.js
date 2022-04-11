import { Mongo } from "meteor/mongo";
import Model from "../Model";
import { tenderUsersSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/tender-users.js";

class TenderUsers extends Model {
  // eslint-disable-next-line camelcase
  static notify_user({ tenderId, userId }) {
    // not wrapping tenderId within braces would result in searching as id: tenderId
    const tenderUsersInstance = TenderUsers.first({ tenderId });
    if (!tenderUsersInstance) {
      TenderUsers.create({ tenderId, userIds: [userId] });
    } else {
      tenderUsersInstance.push({ userIds: userId }, true);
    }
  }
}

TenderUsers._collection = new Mongo.Collection("tender-users");

TenderUsers._collection.attachSchema(tenderUsersSchema);

export { TenderUsers };
