import gql from "graphql-tag";

export const UPDATE_USER_ENTITIES = gql`
  mutation updateUserEntities($input: UserEntityUpdateInput!) {
    updateUserEntities(input: $input) {
      id
      entities
    }
  }
`;
