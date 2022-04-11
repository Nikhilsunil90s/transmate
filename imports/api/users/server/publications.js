/* eslint-disable func-names */
import { Meteor } from "meteor/meteor";
import { User } from "../User.js";

/**
 * publish own user account:
 * @returns cursor of my user & my roles
 */
Meteor.publish(null, function() {
  if (!this.userId) {
    return this.ready();
  }
  const user = User._collection.find(this.userId, {
    fields: {
      createdAt: 1
    }
  });
  return [user];
});
