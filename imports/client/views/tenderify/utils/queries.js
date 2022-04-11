import gql from "graphql-tag";
import { fragments as tenderBidFragments } from "/imports/api/tender-bids/apollo/fragments";
import { fragments as tenderBidMappingFragments } from "/imports/api/tender-bids-mapping/apollo/fragments";
import { fragments as settingsFragments } from "/imports/api/settings/apollo/fragments";

export const GET_TENDERBID = gql`
  query getTenderBid($tenderBidId: String!) {
    tenderBid: getTenderBid(tenderBidId: $tenderBidId) {
      ...tenderBidBase
    }
  }
  ${tenderBidFragments.tenderBidBase}
`;

// method" "tenderify.generateOffer"
export const GENERATE_OFFER_SHEET = gql`
  mutation tenderBidGenerateOfferSheet($tenderBidId: String!) {
    tenderBidGenerateOfferSheet(tenderBidId: $tenderBidId) {
      id
      ...tenderBidOffer
    }
  }
  ${tenderBidFragments.tenderBidOffer}
`;

export const SELECT_PARTNER = gql`
  mutation tenderBidSelectPartner($input: tenderBidSelectPartnerInput!) {
    tenderBidSelectPartner(input: $input) {
      id
      partner {
        id
        name
        management {
          segment
          accountNumbers
          internalContacts {
            userId
            role
          }
        }
        contacts {
          contactType
          type
          firstName
          lastName
          phone
          mail
          linkedId
          userId
        }
      }
    }
  }
`;

export const ADD_TENDERIFY_DOCUMENT = gql`
  mutation tenderBidAddDocument($input: tenderBidAddDocumentInput!) {
    tenderBidAddDocument(input: $input) {
      id
      source {
        documents {
          ...tenderBidDocument
        }
      }
    }
  }
  ${tenderBidFragments.tenderBidDocument}
`;

export const REMOVE_DOCUMENT = gql`
  mutation tenderBidRemoveDocument($input: tenderBidRemoveDocumentInput!) {
    tenderBidRemoveDocument(input: $input) {
      id
      source {
        documents {
          ...tenderBidDocument
        }
      }
    }
  }
  ${tenderBidFragments.tenderBidDocument}
`;

export const GET_TENDER_BID_MAPPINGS = gql`
  query getTenderBidMappings($tenderBidId: String!) {
    bidMappings: getTenderBidMappings(tenderBidId: $tenderBidId) {
      id
      mappings {
        ...TenderBidMappingBase
      }
    }
  }
  ${tenderBidMappingFragments.TenderBidMappingBase}
`;

export const GET_SETTINGS = gql`
  query getSettings {
    settings: getSettings(key: "tenderify-map") {
      id
      ...tenderifySettings
    }
  }
  ${settingsFragments.tenderifySettings}
`;

export const GET_CONTACT_INFO = gql`
  query getContactInfoForTenderify($userId: String!) {
    user: getContactInfo(userId: $userId) {
      id
      email
      name
      avatar
    }
  }
`;

export const ADD_TENDER_BID_MAPPING = gql`
  mutation addTenderBidMapping($input: addTenderBidMappingInput!) {
    addTenderBidMapping(input: $input) {
      id
      mappings {
        ...TenderBidMappingBase
      }
    }
  }
  ${tenderBidMappingFragments.TenderBidMappingBase}
`;

export const EDIT_TENDER_BID_MAPPING = gql`
  mutation editTenderBidMapping($input: editTenderBidMappingInput!) {
    editTenderBidMapping(input: $input) {
      ...TenderBidMappingBase
    }
  }
  ${tenderBidMappingFragments.TenderBidMappingBase}
`;

export const DUPLICATE_TENDER_BID_MAPPING_ROW = gql`
  mutation duplicateTenderBidMappingRow(
    $input: duplicateTenderBidMappingRowInput!
  ) {
    duplicateTenderBidMappingRow(input: $input) {
      ...TenderBidMappingBase
    }
  }
  ${tenderBidMappingFragments.TenderBidMappingBase}
`;

export const GENERATE_TENDER_BID_MAPPING = gql`
  mutation generateTenderBidMapping($mappingId: String!) {
    generateTenderBidMapping(mappingId: $mappingId) {
      id
      mappings {
        ...TenderBidMappingBase
      }
    }
  }
  ${tenderBidMappingFragments.TenderBidMappingBase}
`;

export const GENERATE_TENDER_BID_SHEET = gql`
  mutation generateTenderBidSheet($tenderBidId: String!) {
    generateTenderBidSheet(tenderBidId: $tenderBidId)
  }
`;
