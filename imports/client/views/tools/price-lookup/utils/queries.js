import gql from "graphql-tag";
import { fragments as lookupFragments } from "/imports/api/pricelists/apollo/fragments";

export const DO_PRICE_LOOKUP = gql`
  mutation getManualPriceLookupResult($input: ManualPriceLookupInput!) {
    getManualPriceLookupResult(input: $input) {
      ...manualLookupResponse
    }
  }
  ${lookupFragments.manualLookupResponse}
`;

export const GET_USAGE = gql`
  query getUserActivityPriceLookup($input: GetUserActivityInput!) {
    usage: getUserActivity(input: $input) {
      id
      userId
      activity
      data
      ts
    }
  }
`;
