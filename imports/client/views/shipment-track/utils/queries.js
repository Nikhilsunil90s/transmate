import { gql } from "@apollo/client";
import { fragments as shipmentFragments } from "/imports/api/shipments/apollo/fragments";

export const GET_SHIPMENT_TRACKING_INFO = gql`
  query getShipmentTrackingInfo($shipmentId: String!) {
    shipment: getShipmentTrackingInfo(shipmentId: $shipmentId) {
      id
      status
      number
      pickup {
        ...shipmentStop
        datePlanned
      }
      delivery {
        ...shipmentStop
        datePlanned
      }
      updates {
        action
        data
        accountId
        ts
        userId
      }
    }
  }
  ${shipmentFragments.shipmentStop}
`;
