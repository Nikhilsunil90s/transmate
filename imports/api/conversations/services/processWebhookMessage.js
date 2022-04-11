import { Comments } from "/imports/api/comments/Comments";
import { Conversation } from "/imports/api/conversations/Conversation";

import { PriceRequest } from "/imports/api/priceRequest/PriceRequest";
import get from "lodash.get";
import SecurityChecks from "/imports/utils/security/_security";

const debug = require("debug")("webhook:conversation");

export async function processComment({
  senderId,
  textData,
  documentType,
  documentId,
  meta1,
  meta2
}) {
  let commentsId;
  let conversationId;

  // create the message using {textData}, conversation and sender

  if (documentType === "conversation") {
    conversationId = documentId;
    debug("lets create a normal conversation comment: %o", {
      value: textData,
      conversationId,
      senderId
    });

    // to do : should we check if user is allowed to send to this conversation? now it will show as senderId = server
    ({ _id: commentsId } = await Comments.add_comment({
      value: textData,
      conversationId,
      senderId
    }));
  }
  if (documentType === "pricerequest") {
    const [priceRequestId, accountId, userId] = [documentId, meta1, meta2];
    const priceRequest = await PriceRequest.first(
      {
        "bidders.accountId": accountId,
        _id: priceRequestId,
        $or: [{ requestedBy: userId }, { "bidders.userIds": userId }]
      },
      {
        fields: {
          _id: 1,
          bidders: { $elemMatch: { accountId } },
          requestedBy: 1
        }
      }
    );
    SecurityChecks.checkIfExists(priceRequest);

    // create conversation if does not exist, only one conversation per
    // pricerequest + accountId
    debug("check if conversation exists for query %o", {
      documentType,
      documentId,
      meta: { accountId }
    });
    ({ _id: conversationId } =
      (await Conversation.first(
        {
          documentType,
          documentId,
          meta: { accountId }
        },
        { fields: { _id: 1 } }
      )) || {});

    if (conversationId) {
      debug("conversation id found %s!, we can create comment", conversationId);

      // create comment since conversation already exists
      ({ _id: commentsId } = await Comments.add_comment({
        value: textData,
        senderId: userId,
        conversationId
      }));
    } else {
      //  create comments during conversation
      debug(
        "conversation id not found!, we will create conversation with a comment"
      );

      // then create conversation
      ({ _id: conversationId, commentsId } = Conversation.create({
        subject: `${documentType} ${documentId} ${accountId}`,
        documentType,
        documentId,
        participants: [
          priceRequest.requestedBy,
          ...get(priceRequest, "bidders[0].userIds", [])
        ],
        private: true,
        comment: textData,
        meta: { accountId },
        created: { by: userId, at: new Date() }
      }));
    }
  }
  return { conversationId, commentsId };
}
