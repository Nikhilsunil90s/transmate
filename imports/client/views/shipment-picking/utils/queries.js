import { gql } from "@apollo/client";
import { fragments as shipmentFragments } from "/imports/api/shipments/apollo/fragments";

import { fragments as itemFragments } from "/imports/api/items/apollo/fragments";
import { fragments as pickingFragments } from "/imports/api/shipmentPicking/apollo/fragments";
import { fragments as accountFragments } from "/imports/api/allAccounts/apollo/fragments";

export const GET_PICKING_OVERVIEW = gql`
  query getPickingOverview($input: getPickingOverviewInput!) {
    pickingOverviewData: getPickingOverview(input: $input) {
      id
      status
      tags
      pickingStatus
      ...shipmentReferences
      pickup {
        ...shipmentStop
      }
      delivery {
        ...shipmentStop
      }
      # for itemSummary
      nestedItems {
        id
        type
        description
        quantity {
          code
          amount
          description
        }
        isPicked
        isPackingUnit
      }
      created {
        at
      }
    }
  }
  ${shipmentFragments.shipmentReferences}
  ${shipmentFragments.shipmentStop}
`;

export const GET_PICKING_DETAIL = gql`
  query getPickingDetail($shipmentId: String!) {
    shipment: getPickingDetail(shipmentId: $shipmentId) {
      id
      status
      number
      shipperId
      accountId
      pickingStatus
      ...shipmentReferences
      pickup {
        ...shipmentStop
      }
      delivery {
        ...shipmentStop
      }
      nestedItems {
        ...itemPickingDetail
      }
    }
  }
  ${shipmentFragments.shipmentReferences}
  ${shipmentFragments.shipmentStop}
  ${itemFragments.itemPickingDetail}
`;

export const PRINT_PICKING_LIST = gql`
  mutation printPickingList($shipmentId: String!) {
    printPickingList(shipmentId: $shipmentId) {
      shipment {
        id
        pickingStatus
      }
      documentUrl
    }
  }
`;

export const PACK_SHIPMENT_ITEMS = gql`
  mutation packShipmentItems($input: packShipmentItemsInput!) {
    packShipmentItems(input: $input) {
      shipment {
        id
        status
        pickingStatus
        nestedItems {
          ...itemPickingDetail
        }
      }
      result {
        errors
        successCount
        errorCount
      }
    }
  }
  ${itemFragments.itemPickingDetail}
`;

export const GET_SHIPMENT_LABEL_OPTIONS = gql`
  query getShipmentLabelOptions($packingItemIds: [String]!) {
    labelOptions: getShipmentLabelOptions(packingItemIds: $packingItemIds) {
      ...pickingLabelOption
    }
  }
  ${pickingFragments.pickingLabelOption}
`;

export const CONFIRM_SHIPMENT_LABEL_OPTION = gql`
  mutation confirmShipmentLabelOption(
    $input: confirmShipmentLabelOptionInput!
  ) {
    confirmShipmentLabelOption(input: $input) {
      shipment {
        id
        pickingStatus
        nestedItems {
          id
          labelUrl
        }
      }
      labelUrl
    }
  }
`;

export const CANCEL_PACKING_LABEL = gql`
  mutation cancelPackingLabel($packingItemIds: [String], $shipmentId: String) {
    cancelPackingLabel(
      packingItemIds: $packingItemIds
      shipmentId: $shipmentId
    ) {
      id
      status
      pickingStatus
      nestedItems {
        ...itemPickingDetail
      }
    }
  }
  ${itemFragments.itemPickingDetail}
`;

export const UNPACK_PACKING_ITEMS = gql`
  mutation unpackShipmentItems($packingUnitsIds: [String]!) {
    unpackShipmentItems(packingUnitsIds: $packingUnitsIds) {
      shipment {
        id
        status
        pickingStatus
        nestedItems {
          ...itemPickingDetail
        }
      }
      result {
        errors
        successCount
        errorCount
      }
    }
  }
  ${itemFragments.itemPickingDetail}
`;

export const GET_LOCATION_INFO = gql`
  query getLocationInfoMinimal($id: String!, $type: String!) {
    location: getLocationInfo(id: $id, type: $type) {
      address {
        id
        annotation {
          name
        }
        countryCode
      }
    }
  }
`;

// Manifest Queries
export const GET_MANIFEST = gql`
  query getDataForManifest($addressId: String!) {
    carriers: getDataForManifest(addressId: $addressId) {
      carrierId
      name
      shipments {
        id
        status
        pickingStatus
      }
    }
  }
`;

export const PRINT_SHIPPING_MANIFEST = gql`
  mutation printPickingManifest($input: printPickingManifestInput!) {
    shipments: printPickingManifest(input: $input) {
      id
      status
      number
      accountId
      carrier {
        ...accountBase
      }
      ...shipmentReferences
      pickup {
        ...shipmentStop
      }
      delivery {
        ...shipmentStop
      }
      nestedItems {
        ...itemPickingDetail
      }
    }
  }
  ${shipmentFragments.shipmentReferences}
  ${shipmentFragments.shipmentStop}
  ${itemFragments.itemPickingDetail}
  ${accountFragments.accountBase}
`;

export const SPLIT_SHIPMENT_ITEM = gql`
  mutation splitShipmentItemWhilePacking($input: SplitShipmentItemInput!) {
    splitShipmentItem(input: $input) {
      id
      nestedItems(types: ["HU"]) {
        ...itemPickingDetail
      }
    }
  }
  ${itemFragments.itemPickingDetail}
`;

export const UPDATE_SHIPMENT_LOCATION = gql`
  mutation updateShipmentLocationInPickingScreen(
    $input: UpdateShipmentLocationinput!
  ) {
    updateShipmentLocation(input: $input) {
      id
      pickup {
        ...shipmentStop
      }
      delivery {
        ...shipmentStop
      }
    }
  }
  ${shipmentFragments.shipmentStop}
`;
