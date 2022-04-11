import gql from "graphql-tag";
import { fragments as conversationFragments } from "/imports/api/conversations/apollo/fragments";

export const NEW_CONVERSATION = gql`
  mutation createConversation($input: CreateConversationInput!) {
    createConversation(input: $input) {
      ...conversationBase
    }
  }
  ${conversationFragments.conversationBase}
`;
