import { gql } from "@apollo/client";
import { fragments as shipmentFragments } from "/imports/api/shipments/apollo/fragments";

export const GET_SHIPMENT = gql`
  query getShipmentRequest($shipmentId: String!) {
    shipment: getShipment(shipmentId: $shipmentId) {
      id
      number
      pickup {
        ...shipmentStop
      }
      delivery {
        ...shipmentStop
      }
      ...shipmentItems
      ...shipmentRequest
    }
  }
  ${shipmentFragments.shipmentStop}
  ${shipmentFragments.shipmentItems}
  ${shipmentFragments.shipmentRequest}
`;

export const UPDATE_SHIPMENT_REFS = gql`
  mutation updateShipmentInRequestPage(
    $shipmentId: String!
    $updates: JSONObject
  ) {
    updateShipment(shipmentId: $shipmentId, updates: $updates) {
      id
      references {
        number
        booking
        carrier
        consignee
        bof
        fa
        container
        cmr
      }
      notes {
        BookingNotes
        PlanningNotes
        LoadingNotes
        UnloadingNotes
        OtherNotes
        TemperatureControl
      }
      tags
      carrierIds
    }
  }
`;

export const CONFIRM_SHIPMENT_REQUEST = gql`
  mutation confirmShipmentRequest($shipmentId: String!) {
    confirmShipmentRequest(shipmentId: $shipmentId) {
      id
      status
      ...shipmentRequest
    }
  }
  ${shipmentFragments.shipmentRequest}
`;
