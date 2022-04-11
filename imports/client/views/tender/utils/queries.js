import gql from "graphql-tag";
import { fragments as tenderFragments } from "/imports/api/tenders/apollo/fragments";
import { fragments as conversationFragments } from "/imports/api/conversations/apollo/fragments";

export const GET_TENDER = gql`
  query getTenderForPage($tenderId: String!) {
    tender: getTender(tenderId: $tenderId) {
      ...tenderBase
      ...tenderPackages
      ...tenderBidders
      ...tenderDocuments
    }
  }
  ${tenderFragments.tenderBase}
  ${tenderFragments.tenderPackages}
  ${tenderFragments.tenderBidders}
  ${tenderFragments.tenderDocuments}
`;

export const UPDATE_TENDER = gql`
  mutation updateTenderInPage($input: UpdateTenderInput) {
    updateTender(input: $input) {
      ...tenderBase
      ...tenderPackages
      ...tenderBidders
      ...tenderDocuments
    }
  }
  ${tenderFragments.tenderBase}
  ${tenderFragments.tenderPackages}
  ${tenderFragments.tenderBidders}
  ${tenderFragments.tenderDocuments}
`;

export const GET_ACCOUNT_CONTACTS_QUERY = gql`
  query getUsersForAccount($accountId: String!, $roles: [String]) {
    users: getUsersForAccount(accountId: $accountId, roles: $roles) {
      id
      email
      name
    }
  }
`;

export const GET_CONTACT_INFO = gql`
  query getContactInfoForTender($userId: String!) {
    user: getContactInfo(userId: $userId) {
      id
      email
      name
      avatar
    }
  }
`;

export const SAVE_TENDER_DETAILS = gql`
  mutation saveTenderDetails($input: [SaveTenderDetailInput]!) {
    saveTenderDetails(input: $input)
  }
`;

export const SAVE_BIDDER_TIMESTAMP = gql`
  mutation setBidderTimeStamp($tenderId: String!) {
    setBidderTimeStamp(tenderId: $tenderId)
  }
`;

export const GET_MY_PRICELISTS = gql`
  query getOwnPriceListsTender($input: GetPriceListsInput!) {
    priceLists: getOwnPriceLists(input: $input) {
      id
      title
      carrierName
      type
      status
    }
  }
`;

export const SAVE_BIDDERS = gql`
  mutation saveBidders($input: SaveTenderBiddersInput!) {
    saveBidders(input: $input) {
      errors
      success {
        accountsAdded
        accountsRemoved
      }
    }
  }
`;

export const BID_FIXED_PRICELIST = gql`
  mutation tenderBidFixedPriceList($tenderId: String!) {
    tenderBidFixedPriceList(tenderId: $tenderId) {
      myBid {
        accountId
        priceLists {
          id
          title
        }
      }
      priceListId
    }
  }
`;

export const ADD_ATTACHMENT = gql`
  mutation addAttachmentTender($input: UpdateTenderAttachmentInput!) {
    addAttachmentTender(input: $input) {
      id
      ...tenderDocuments
    }
  }
  ${tenderFragments.tenderDocuments}
`;

export const REMOVE_ATTACHMENT = gql`
  mutation removeAttachmentTender($input: UpdateTenderAttachmentInput!) {
    removeAttachmentTender(input: $input) {
      id
      ...tenderDocuments
    }
  }
  ${tenderFragments.tenderDocuments}
`;

export const UPDATE_BID = gql`
  mutation tenderUpdateBid($input: TenderUpdateBidInput!) {
    tenderUpdateBid(input: $input) {
      ...tenderBidder
    }
  }
  ${tenderFragments.tenderBidder}
`;

export const GENERATE_PACKAGES = gql`
  mutation generateTenderPackages($tenderId: String!) {
    generateTenderPackages(tenderId: $tenderId) {
      id
      ...tenderPackages
    }
  }
  ${tenderFragments.tenderPackages}
`;

export const UPDATE_STATUS = gql`
  mutation updateTenderStatus($input: UpdateTenderStatusInput!) {
    updateTenderStatus(input: $input) {
      id
      status
    }
  }
`;

export const CREATE_CONVERSATION = gql`
  mutation createConversationForTender($input: CreateConversationInput!) {
    createConversation(input: $input) {
      ...conversationBase
    }
  }
  ${conversationFragments.conversationBase}
`;
