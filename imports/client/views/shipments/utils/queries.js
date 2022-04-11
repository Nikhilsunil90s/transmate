import gql from "graphql-tag";
import { fragments as shipmentImportFragments } from "/imports/api/imports/apollo/fragments";
import { fragments as shipmentViewFragments } from "/imports/api/views/apollo/fragments";

export const GET_SHIPMENT_VIEWS = gql`
  query getShipmentViews {
    views: getShipmentViews {
      ...shipmentViewBase
    }
    preferences: getUserPreferences {
      views {
        shipments
      }
    }
  }
  ${shipmentViewFragments.shipmentViewBase}
`;

export const GET_SHIPMENT_VIEW_COLUMNS = gql`
  query getShipmentViewForShipmentOverview($viewId: String!) {
    view: getShipmentView(viewId: $viewId) {
      id
      columns
    }
  }
`;

export const GET_PAGED_SHIPMENT_OVERVIEW = gql`
  query getPagedShipmentOverview($input: PagedShipmentOverviewInput!) {
    result: getPagedShipmentOverview(input: $input) {
      data
      recordsTotal
      recordsFiltered
      jobId
    }
  }
`;

export const CREATE_SHIPMENT_IMPORT = gql`
  mutation createShipmentImport {
    createShipmentImport {
      ...shipmentImportBase
    }
  }
  ${shipmentImportFragments.shipmentImportBase}
`;

export const UPDATE_USER_PREFERENCES = gql`
  mutation updateUserPreferencesInShipmentOverview(
    $input: UpdateUserPreferenceByTopicInput!
  ) {
    updateUserPreferenceByTopic(input: $input) {
      id
      preferences {
        views {
          shipments
        }
      }
    }
  }
`;
