import { Conversation } from "/imports/api/conversations/Conversation";

export const createConversation = ({ accountId, userId }) => ({
  accountId,
  userId,
  async create({
    participants,
    subject,
    message,
    documentType,
    documentId,
    broadcast
  }) {
    const data = {
      participants,
      subject,
      message,
      documentType,
      documentId,
      broadcast
    };
    if (broadcast) {
      data.private = false;
    }
    this.conversation = await Conversation.create(data);
  },
  getUIResponse() {
    return this.conversation;
  }
});
