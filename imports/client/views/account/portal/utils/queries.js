import gql from "graphql-tag";
import { fragments } from "/imports/api/accountPortal/apollo/fragments";

export const GET_PORTAL_DATA = gql`
  query getPortalData($input: GetPortalDataInput!) {
    result: getPortalData(input: $input) {
      profile {
        ...portalData
      }

      # projection
      canEdit
      activeUser {
        type
        name
        mail
        status
      }
    }
  }
  ${fragments.portalData}
`;

export const UPDATE_PORTAL_DATA = gql`
  mutation updatePortalData($input: UpdatePortalDataInput!) {
    updatePortalData(input: $input) {
      ...portalData
    }
  }
  ${fragments.portalData}
`;

export const PORTAL_UNSUBSCRIBE = gql`
  mutation unSubscribePortalContact($input: UnsubscribePortalContactInput!) {
    unSubscribePortalContact(input: $input)
  }
`;
