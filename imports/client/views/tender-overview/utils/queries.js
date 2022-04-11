import gql from "graphql-tag";
import { fragments as tenderFragments } from "/imports/api/tenders/apollo/fragments";

export const GET_TENDERS = gql`
  query getTendersForOverview($viewKey: String) {
    tenders: getTenders(viewKey: $viewKey) {
      id
      number
      title
      created {
        by
        at
      }
      status
      carrierCount
      accountId
    }
  }
`;

export const CREATE_TENDER = gql`
  mutation createTender($data: JSONObject!) {
    createTender(data: $data) {
      ...tenderBase
    }
  }
  ${tenderFragments.tenderBase}
`;

export const DUPLICATE_TENDER = gql`
  mutation duplicateTenderInOverview($input: duplicateTenderInput!) {
    duplicateTender(input: $input) {
      ...tenderBase
    }
  }
  ${tenderFragments.tenderBase}
`;
