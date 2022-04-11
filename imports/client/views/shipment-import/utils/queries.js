import { gql } from "@apollo/client";
import { fragments as shipmentImportFragments } from "/imports/api/imports/apollo/fragments";

export const INITIALIZE_MAPPING = gql`
  mutation initializeShipmentImportMapping(
    $input: InitializeShipmentImportMappingInput!
  ) {
    initializeShipmentImportMapping(input: $input) {
      id
      mapping {
        headers
        values
        samples
      }
      ...importProgress
      ...importErrors
    }
  }
  ${shipmentImportFragments.importProgress}
  ${shipmentImportFragments.importErrors}
`;

export const GET_IMPORT_DOC = gql`
  query getShipmentImport($importId: String!) {
    imp: getShipmentImport(importId: $importId) {
      ...shipmentImportBase
    }
  }
  ${shipmentImportFragments.shipmentImportBase}
`;

export const INSERT_ROW = gql`
  mutation insertShipmentImportRow($input: ShipmentImportRowInput!) {
    insertShipmentImportRow(input: $input)
  }
`;

export const FLAG_IMPORT_DONE = gql`
  mutation importDoneShipmentImport($importId: String!) {
    importDoneShipmentImport(importId: $importId) {
      ...shipmentImportBase
    }
  }
  ${shipmentImportFragments.shipmentImportBase}
`;

export const GET_IMPORT_ROWS = gql`
  query getShipmentImportRows($importId: String!) {
    imp: getShipmentImportRows(importId: $importId) {
      id
      ...importProgress
      ...shipmentImportRows
    }
  }
  ${shipmentImportFragments.importProgress}
  ${shipmentImportFragments.shipmentImportRows}
`;

export const CANCEL_IMPORT = gql`
  mutation cancelShipmentImport($importId: String!) {
    cancelShipmentImport(importId: $importId) {
      id
      ...importProgress
    }
  }
  ${shipmentImportFragments.importProgress}
`;

export const REVERT_IMPORT = gql`
  mutation revertShipmentImport($importId: String!) {
    revertShipmentImport(importId: $importId) {
      id
      ...importProgress
    }
  }
  ${shipmentImportFragments.importProgress}
`;

export const MAP_HEADER = gql`
  mutation mapShipmentImportHeader($input: ShipmentImportHeaderMapInput!) {
    mapShipmentImportHeader(input: $input) {
      id
      mapping {
        headers
        values
      }
      ...importErrors
    }
  }
  ${shipmentImportFragments.importErrors}
`;

export const MAP_VALUE = gql`
  mutation mapShipmentImportValue($input: ShipmentImportValueMapInput!) {
    mapShipmentImportValue(input: $input) {
      ...shipmentImportBase
    }
  }
  ${shipmentImportFragments.shipmentImportBase}
`;

export const PROCESS_IMPORT = gql`
  mutation processShipmentImport($importId: String!) {
    processShipmentImport(importId: $importId)
  }
`;

export const RESTART_IMPORT = gql`
  mutation restartShipmentImport($importId: String!) {
    restartShipmentImport(importId: $importId) {
      ...shipmentImportBase
    }
  }
  ${shipmentImportFragments.shipmentImportBase}
`;

export const UPDATE_IMPORT_SETTINGS = gql`
  mutation updateShipmentImport($input: UpdateShipmentImportInput!) {
    updateShipmentImport(input: $input) {
      ...shipmentImportBase
    }
  }
  ${shipmentImportFragments.shipmentImportBase}
`;
