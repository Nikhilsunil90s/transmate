import gql from "graphql-tag";
import { fragments as shipmentFragments } from "/imports/api/shipments/apollo/fragments";

export const UPDATE_NOTES = gql`
  mutation updateShipmentInNotesSection(
    $shipmentId: String!
    $updates: JSONObject
  ) {
    updateShipment(shipmentId: $shipmentId, updates: $updates) {
      id
      ...shipmentNotes
    }
  }
  ${shipmentFragments.shipmentNotes}
`;
