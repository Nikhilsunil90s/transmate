import { gql } from "@apollo/client";
import { fragments as shipmentFragments } from "/imports/api/shipments/apollo/fragments";

export const ADD_SHIPMENT_DOCUMENT = gql`
  mutation addShipmentDocument($input: DocumentInput!) {
    addShipmentDocument(input: $input) {
      id
      ...shipmentDocuments
    }
  }
  ${shipmentFragments.shipmentDocuments}
`;

export const REMOVE_SHIPMENT_DOC = gql`
  mutation removeShipmentDocument($input: RemoveShipmentDocInput!) {
    removeShipmentDocument(input: $input) {
      id
      ...shipmentDocuments
    }
  }
  ${shipmentFragments.shipmentDocuments}
`;

export const GENERATE_SHIPMENT_DOC = gql`
  mutation generateShipmentDocument($input: GenerateShipmentDocInput!) {
    generateShipmentDocument(input: $input) {
      id
      ...shipmentDocuments
    }
  }
  ${shipmentFragments.shipmentDocuments}
`;
