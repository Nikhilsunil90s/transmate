import { Mongo } from "meteor/mongo";
import Model from "../Model";
import { commentsSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/comments";

class Comments extends Model {
  // eslint-disable-next-line camelcase
  static add_comment({ value, conversationId, senderId }) {
    const created = {
      by: senderId,
      at: new Date()
    };

    return Comments.create_async(
      { value, conversationId, created },
      { userId: senderId }
    );
  }
}

Comments._collection = new Mongo.Collection("comments");
Comments._collection.attachSchema(commentsSchema);
Comments._collection = Comments.updateByAt(Comments._collection);
export { Comments };
