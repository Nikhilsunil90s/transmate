import { gql } from "@apollo/client";

export const CREATE_SHIPMENT = gql`
  mutation createShipment($input: CreateShipmentInput!) {
    shipmentId: createShipment(input: $input)
  }
`;
