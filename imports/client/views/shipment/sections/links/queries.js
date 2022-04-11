import gql from "graphql-tag";

export const UNLINK_PRICE_REQUEST_FROM_SHIPMENT = gql`
  mutation unlinkPriceRequestFromShipment($shipmentId: String!) {
    unlinkPriceRequestFromShipment(shipmentId: $shipmentId) {
      id
      links {
        id
        type
        data
      }
      priceRequestId
    }
  }
`;
