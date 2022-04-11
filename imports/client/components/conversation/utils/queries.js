import gql from "graphql-tag";
import { fragments as conversationFragments } from "/imports/api/conversations/apollo/fragments";

export const GET_CONVERSATION = gql`
  query getConversation($conversationId: String!) {
    conversation: getConversation(conversationId: $conversationId) {
      ...conversationBase
      ...conversationComments
    }
  }
  ${conversationFragments.conversationBase}
  ${conversationFragments.conversationComments}
`;

export const REMOVE_COMMENT = gql`
  mutation removeConversationComment($commentId: String!) {
    removeConversationComment(commentId: $commentId)
  }
`;

export const UPDATE_COMMENT = gql`
  mutation updateConversationComment($input: UpdateConversationCommentInput!) {
    updateConversationComment(input: $input)
  }
`;

export const ADD_COMMENT = gql`
  mutation addConversationComment($input: AddConversationCommentInput!) {
    addConversationComment(input: $input)
  }
`;
