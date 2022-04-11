import { gql } from "@apollo/client";

export const SAVE_LANE = gql`
  mutation createShipmentInPriceRequest($input: CreateShipmentInput!) {
    shipmentId: createShipment(input: $input)
  }
`;
