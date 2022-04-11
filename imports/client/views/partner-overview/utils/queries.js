import { gql } from "@apollo/client";

export const GET_PARTNERS_VIEW = gql`
  query getPartnersView($input: getPartnersViewInput!) {
    partners: getPartnersView(input: $input) {
      id
      type
      status
      name
    }
  }
`;
