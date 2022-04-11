import { gql } from "@apollo/client";
import { fragments as priceRequestFragments } from "/imports/api/priceRequest/apollo/fragments";

export const GET_PRICEREQUEST_VIEW = gql`
  query getPriceRequestView($input: getPriceRequestViewInput) {
    priceRequests: getPriceRequestView(input: $input) {
      id
      status
      title
      dueDate

      # projections
      numberOfItems
      partners

      ...priceRequestInsights # for status field
    }
  }
  ${priceRequestFragments.priceRequestInsights}
`;
