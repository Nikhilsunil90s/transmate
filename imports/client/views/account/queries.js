import gql from "graphql-tag";

export const GET_PROFILE_QUERY = gql`
  query getProfile($accountId: String!) {
    getProfile(accountId: $accountId)
  }
`;

export const CREATE_USER_BY_CONTACT = gql`
  mutation createUserByContact($input: CreateUserByContactInput!) {
    createUserByContact(input: $input) {
      userId
      url
    }
  }
`;
