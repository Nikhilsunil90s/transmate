import { Meteor } from "meteor/meteor";

import { Comments } from "/imports/api/comments/Comments.js";

Meteor.publish("comment.view", function publish(_id) {
  check(_id, String);

  if (!this.userId) {
    return this.ready();
  }

  return Comments.find({ conversationId: _id });
});
