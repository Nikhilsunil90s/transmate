import gql from "graphql-tag";

export const fragments = {
  conversationBase: gql`
    fragment conversationBase on Conversation {
      id
      subject
      created {
        by
        at
      }
      participants
      status
      private
      broadcast
      user {
        id
        name
        avatar
      }
    }
  `,
  conversationComments: gql`
    fragment conversationComments on Conversation {
      comments {
        id
        value
        user {
          id
          name
          avatar
        }
        created {
          by
          at
        }
      }
    }
  `
};
