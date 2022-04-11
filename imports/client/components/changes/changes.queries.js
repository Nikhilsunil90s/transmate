import { gql } from "@apollo/client";

export const GET_SHIPMENT_CHANGES = gql`
  query getShipmentChanges($shipmentId: String!) {
    shipment: getShipmentChanges(shipmentId: $shipmentId) {
      id
      changes
    }
  }
`;
