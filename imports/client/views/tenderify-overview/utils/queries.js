import gql from "graphql-tag";
import { fragments as tenderBidFragments } from "/imports/api/tender-bids/apollo/fragments";

export const GET_TENDER_BIDS = gql`
  query getTenderBidsForOverview($viewKey: String!) {
    tenderBids: getTenderBidOverview(viewKey: $viewKey) {
      id
      number
      name
      ...tenderBidTenderInfo
      partner {
        name
      }
      created {
        by
        at
      }
      status
    }
  }
  ${tenderBidFragments.tenderBidTenderInfo}
`;

export const CREATE_TENDER_BID = gql`
  mutation createTenderBid {
    newTenderBid: createTenderBid {
      ...tenderBidBase
    }
  }
  ${tenderBidFragments.tenderBidBase}
`;
