import SecurityChecks from "/imports/utils/security/_security";
import { Comments } from "/imports/api/comments/Comments";
import { Conversation } from "/imports/api/conversations/Conversation";
import { User } from "/imports/api/users/User";

import { createConversation } from "/imports/api/conversations/services/mutation.createConversation";
import { getConversations } from "../services/query.getConversations";

export const resolvers = {
  Conversation: {
    user(parent) {
      const userId = parent.created?.by;
      return User.first(userId, { fields: { profile: 1 } });
    },
    participantCount(parent) {
      return parent.participants?.length || 0;
    }
  },
  ConversationComment: {
    user(parent) {
      const userId = parent.createdByAt?.by;
      return User.first(userId, { fields: { profile: 1 } });
    }
  },
  Query: {
    async getConversation(root, args, context) {
      const { userId } = context;
      SecurityChecks.checkLoggedIn(userId);
      const { conversationId } = args;

      const res = await Conversation._collection.aggregate([
        {
          $match: {
            $and: [
              { _id: conversationId },
              { $or: [{ participants: userId }, { userId }] }
            ]
          }
        },
        { $addFields: { id: "$_id" } },
        {
          $lookup: {
            from: "comments",
            let: { conversationId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$conversationId", "$$conversationId"] }
                }
              },
              { $addFields: { id: "$_id" } }
            ],
            as: "comments"
          }
        }
      ]);

      return res[0];
    },
    async getConversations(root, args, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);
      const { filters } = args;

      getConversations({ userId, accountId }).get({ filters });
    }
  },
  Mutation: {
    async removeConversationComment(root, args, context) {
      const { userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { commentId } = args;

      const comment = await Comments.first(commentId);
      if (!comment) throw new Meteor.Error("not-found", "Comment not found");

      if (comment.created.by !== userId)
        throw new Meteor.Error("invalid", "You cannot remove this comment");

      return comment.destroy();
    },
    async updateConversationComment(root, args, context) {
      const { userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { value, commentId } = args.input;

      const comment = await Comments.first(commentId);
      if (!comment) throw new Meteor.Error("not-found", "Comment not found");
      if (comment.created.by !== userId)
        throw new Meteor.Error("invalid", "You cannot remove this comment");

      await comment.update({ value });
      return commentId;
    },
    async addConversationComment(root, args, context) {
      const { userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const { value, conversationId } = args.input;

      const conversation = await Conversation.first(conversationId);

      // Validating that a conversation with such Id exists
      if (!conversation)
        throw new Meteor.Error("not-found", "Conversation not found");

      // Also that such account id is a participant in the conversation
      if (!conversation.participants.includes(userId)) {
        throw new Meteor.Error("not-found", "Participant not found");
      }

      const newComment = await Comments.add_comment({
        value,
        conversationId,
        senderId: userId
      });
      return newComment.id;
    },
    async createConversation(root, args, context) {
      const { userId, accountId } = context;
      SecurityChecks.checkLoggedIn(userId);

      const {
        participants,
        subject,
        message,
        documentType,
        documentId,
        broadcast
      } = args.input;

      const srv = createConversation({ accountId, userId });
      await srv.create({
        participants,
        subject,
        message,
        documentType,
        documentId,
        broadcast
      });

      return srv.getUIResponse();
    }
  }
};
