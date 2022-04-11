import { gql } from "@apollo/client";
import { fragments } from "/imports/api/shipments/apollo/fragments";

export const UPDATE_REFERENCES = gql`
  mutation updateShipmentInReferenceSection(
    $shipmentId: String!
    $updates: JSONObject
  ) {
    updateShipment(shipmentId: $shipmentId, updates: $updates) {
      id
      ...shipmentReferences
    }
  }
  ${fragments.shipmentReferences}
`;
