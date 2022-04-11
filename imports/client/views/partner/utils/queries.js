import gql from "graphql-tag";
import { fragments as accountFragments } from "/imports/api/allAccounts/apollo/fragments";

export const GET_PARTNER = gql`
  query getPartnerForPage($partnerId: String!) {
    partner: getPartner(partnerId: $partnerId) {
      ...accountBase
      ...accountProfile
      ...accountAnnotation
      partnership {
        status
        requestor
      }
    }
  }
  ${accountFragments.accountBase}
  ${accountFragments.accountProfile}
  ${accountFragments.accountAnnotation}
`;

export const UPDATE_PARTNER = gql`
  mutation annotatePartner($input: AccountAnnotateInput!) {
    annotatePartner(input: $input) {
      id
      ...accountAnnotation
    }
  }
  ${accountFragments.accountAnnotation}
`;

export const GET_PARTNER_ASIDE = gql`
  query getPartnerForAside($partnerId: String!) {
    account: getPartner(partnerId: $partnerId) {
      id
      logo
    }
  }
`;

export const GET_INVOICES = gql`
  query getInvoiceOverviewForPartnerPage($filters: InvoiceOverviewInput) {
    invoices: getInvoiceOverview(filters: $filters) {
      id
      number
      status
      date
      amount {
        value
        currency
      }
      itemCount
    }
  }
`;

export const ADD_SCORING = gql`
  mutation addPartnerReview(
    $partnerId: String!
    $scoring: [PartnerScoringInput]
  ) {
    addPartnerReview(partnerId: $partnerId, scoring: $scoring)
  }
`;
