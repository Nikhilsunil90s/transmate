import { Conversation } from "../Conversation";

// const debug = require("debug")("tenderify:method");

export const getConversations = ({ userId, accountId }) => ({
  userId,
  accountId,
  fields: {
    subject: 1,
    participants: 1,
    created: 1,
    status: 1,
    broadcast: 1
  },

  async get({ filters }) {
    const list = await Conversation.where(
      {
        $and: [
          { $or: [{ participants: this.userId }, { userId: this.userId }] },
          filters
        ]
      },
      { fields: this.fields }
    );

    return list;
  }
});
