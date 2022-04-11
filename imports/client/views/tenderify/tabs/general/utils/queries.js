import gql from "graphql-tag";
import { fragments as tenderBidFragments } from "/imports/api/tender-bids/apollo/fragments";

export const UPDATE_TENDER_BID_GENERAL = gql`
  mutation updateTenderBidGeneralSection($input: updateTenderBidInput!) {
    updateTenderBid(input: $input) {
      id
      name
      ...tenderBidTenderInfo
    }
  }
  ${tenderBidFragments.tenderBidTenderInfo}
`;
