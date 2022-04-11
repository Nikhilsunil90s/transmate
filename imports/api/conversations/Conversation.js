import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { JobManager } from "../../utils/server/job-manager.js";
import Model from "../Model";

// collections
import { ConversationSchema } from "../_jsonSchemas/simple-schemas/collections/conversations";
import { Comments } from "/imports/api/comments/Comments";

const debug = require("debug")("conversation:model");

class Conversation extends Model {
  static setUsers(obj, context) {
    const authorUserId = context.userId;
    let participants = [];
    participants = [].concat(
      ...obj.participants.map(participant => {
        return participant.split(",");
      })
    );

    if (authorUserId && !participants.includes(authorUserId)) {
      participants = [authorUserId, ...obj.participants];
    }
    debug("conversation setUsers participants", participants);
    return participants;
  }

  // eslint-disable-next-line camelcase
  static before_create(obj) {
    debug("conversation before_create(obj)", obj);
    if (!Array.isArray(obj.participants))
      obj.participants = Conversation.setUsers(obj);

    if (obj.comment) {
      debug("create comment for conversation", obj.comment);
      const { _id } = Comments.create({
        value: obj.comment,
        created: obj.created
      });
      obj.commentsId = _id;
      debug("comment created", obj.commentsId);
    } else {
      debug("conversation ERROR (obj)", obj);
      throw Error("the conversation always start with a comment!");
    }

    return obj;
  }

  // eslint-disable-next-line camelcase
  static after_create(conversationInstance) {
    const { commentsId, _id: conversationId } = conversationInstance;
    if (commentsId) {
      debug("update commentsId with conversationId");
      const comment = Comments.first(commentsId);
      if (!comment)
        throw Error(
          "during conversation creation, a commentsId was given but comment obj was not found in db"
        );
      comment.save({ conversationId });

      Meteor.defer(() => {
        JobManager.post("conversation.added", conversationInstance);
      });
    } else {
      throw Error("conversation creation should always include a comment");
    }
  }

  static broadcast(conversationInstance) {
    conversationInstance.participants = Conversation.setUsers(
      conversationInstance
    );

    Meteor.defer(() => {
      JobManager.post("conversation.added", conversationInstance);
    });
  }
}

Conversation._collection = new Mongo.Collection("conversations");

Conversation._collection.attachSchema(ConversationSchema);
Conversation._collection = Conversation.updateByAt(Conversation._collection);
export { Conversation };
