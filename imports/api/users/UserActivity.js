import { Mongo } from "meteor/mongo";
import Model from "../Model";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";

class UserActivity extends Model {
  static saveActivity({ userId, accountId, activity, data }) {
    const accId = accountId || AllAccounts.id(userId);

    this._collection.insert({
      userId,
      accountId: accId,
      activity,
      data,
      ts: new Date()
    });
  }
}

UserActivity._collection = new Mongo.Collection("users.activity", {
  idGeneration: "MONGO"
});

export { UserActivity };
