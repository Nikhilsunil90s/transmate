import { Mongo } from "meteor/mongo";
import Model from "../Model.js";

class Notification extends Model {
  // eslint-disable-next-line camelcase
  static before_create(obj) {
    delete obj.createdAt;
    obj.created = new Date();
    return obj;
  }
}

Notification._collection = new Mongo.Collection("notifications");
Notification._collection = Notification.updateByAt(Notification._collection);
export { Notification };
