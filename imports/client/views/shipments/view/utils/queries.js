import gql from "graphql-tag";
import { fragments } from "/imports/api/views/apollo/fragments";

export const GET_VIEW = gql`
  query getShipmentViewDetail($viewId: String!) {
    view: getShipmentView(viewId: $viewId, full: true) {
      ...shipmentView
    }
  }
  ${fragments.shipmentView}
`;

export const UPSERT_SHIPMENT_VIEW = gql`
  mutation upsertShipmentView($input: UpsertShipmentViewInput!) {
    upsertShipmentView(input: $input) {
      ...shipmentView
    }
  }
  ${fragments.shipmentView}
`;

export const GET_ENTITIES = gql`
  query getOwnAccountForEntityInShipment {
    data: getOwnAccount {
      id
      entities {
        code
        name
        country
      }
    }
  }
`;

export const GET_ACTIVE_PROJECTS = gql`
  query getShipmentProjectsForShipmentViewPage {
    data: getShipmentProjects {
      id
      title
      year
      type {
        group
        code
        name
      }
    }
  }
`;

export const REMOVE_SHIPMENT_VIEW = gql`
  mutation removeShipmentView($viewId: String!) {
    removeShipmentView(viewId: $viewId)
  }
`;
