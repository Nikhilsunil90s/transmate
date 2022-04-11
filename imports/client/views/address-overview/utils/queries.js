import gql from "graphql-tag";
import { fragments as addressFragments } from "/imports/api/addresses/apollo/fragments";

export const GET_ADDRESS_OVERVIEW = gql`
  query getAddressesForOverview($input: getAddressOverviewInput!) {
    addresses: getAddressOverview(input: $input) {
      ...addressOverviewItem
    }
  }
  ${addressFragments.addressOverviewItem}
`;
