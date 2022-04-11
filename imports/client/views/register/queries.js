import gql from "graphql-tag";

export const DECODE_USER_TOKEN_QUERY = gql`
  query decodeTokenQuery($token: String!) {
    decodeToken(token: $token) {
      route {
        _id
        page
        section
      }
      meteorToken {
        token
      }
      userId
      reason
      err
    }
  }
`;
