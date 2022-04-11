import { gql } from "@apollo/client";
import { fragments as shipmentFragments } from "/imports/api/shipments/apollo/fragments";

export const UPDATE_TAGS = gql`
  mutation updateShipmentTags($shipmentId: String!, $tags: [String]) {
    updateShipmentTags(shipmentId: $shipmentId, tags: $tags) {
      id
      tags
      ...shipmentUpdates
    }
  }
  ${shipmentFragments.shipmentUpdates}
`;
