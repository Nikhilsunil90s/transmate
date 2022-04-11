import gql from "graphql-tag";
import { fragments as shipmentFragments } from "/imports/api/shipments/apollo/fragments";

export const GET_SHIPMENT = gql`
  query getShipmentMain($shipmentId: String!) {
    shipment: getShipment(shipmentId: $shipmentId) {
      ...shipmentComplete
    }
  }
  ${shipmentFragments.shipmentComplete}
`;

export const GET_SHIPMENT_ASIDE = gql`
  query getShipmentAside($shipmentId: String!) {
    shipment: getShipment(shipmentId: $shipmentId) {
      id
      pickup {
        ...shipmentStop
      }
      delivery {
        ...shipmentStop
      }
      account {
        id
        name
      }
      carrier {
        id
        name
      }
      shipper {
        id
        name
      }
      created {
        by
        at
      }
      eta
    }
  }
  ${shipmentFragments.shipmentStop}
`;

export const GET_SHIPMENT_SIDEBAR = gql`
  query getShipmentSidebar($shipmentId: String!) {
    shipment: getShipment(shipmentId: $shipmentId) {
      id
      priceRequestId
    }
  }
`;

export const UPDATE_SHIPMENT = gql`
  mutation updateShipmentInShipmentPage(
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

export const CANCEL_SHIPMENT = gql`
  mutation cancelShipment($shipmentId: String!) {
    cancelShipment(shipmentId: $shipmentId) {
      id
    }
  }
`;

export const UNCANCEL_SHIPMENT = gql`
  mutation unCancelShipment($shipmentId: String!) {
    unCancelShipment(shipmentId: $shipmentId) {
      id
      status
    }
  }
`;

export const UPDATE_SHIPMENT_ASIDE = gql`
  mutation updateShipmentInShipmentAside(
    $shipmentId: String!
    $updates: JSONObject
  ) {
    updateShipment(shipmentId: $shipmentId, updates: $updates) {
      id
      pickup {
        date
        datePlanned
      }
      delivery {
        date
        datePlanned
      }
    }
  }
`;
