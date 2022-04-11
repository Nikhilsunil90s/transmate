import { gql } from "@apollo/client";
import { fragments as tenderBidFragments } from "/imports/api/tender-bids/apollo/fragments";

export const GET_TENDER_BID_SIDEBAR_DATA = gql`
  query getTenderBidSideBar($tenderBidId: String!) {
    tenderBid: getTenderBid(tenderBidId: $tenderBidId) {
      ...tenderBidSideBar
    }
  }
  ${tenderBidFragments.tenderBidSideBar}
`;

export const UPDATE_TENDER_BID_SIDEBAR = gql`
  mutation updateTenderBidInSideBar($input: updateTenderBidInput!) {
    updateTenderBid(input: $input) {
      ...tenderBidSideBar
    }
  }
  ${tenderBidFragments.tenderBidSideBar}
`;

export const AUTO_SELECT_PRICELISTS_TENDER_BID = gql`
  mutation tenderBidAutoSelectPricelists($tenderBidId: String!) {
    tenderBidAutoSelectPricelists(tenderBidId: $tenderBidId) {
      id
      ...tenderBidSettings
    }
  }
  ${tenderBidFragments.tenderBidSettings}
`;
