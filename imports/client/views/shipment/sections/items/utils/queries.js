import gql from "graphql-tag";
import { fragments as shipmentFragments } from "/imports/api/shipments/apollo/fragments";

export const GET_SETTINGS_DATA = gql`
  query getAccountSettingsItemSection {
    accountSettings: getAccountSettings {
      id
      itemUnits {
        type
        name
        description
        code
        unitType
        taxKeys
      }
    }
  }
`;

export const SAVE_SHIPMENT_ITEM = gql`
  mutation saveShipmentItem($input: SaveShipmentItemInput) {
    saveShipmentItem(input: $input) {
      id
      ...shipmentItems
      hasItems
    }
  }
  ${shipmentFragments.shipmentItems}
`;

export const CHANGE_SHIPMENT_ITEM_PARENT_NODE = gql`
  mutation changeShipmentItemParentNode(
    $input: ChangeShipmentItemParentNodeInput
  ) {
    changeShipmentItemParentNode(input: $input) {
      id
      ...shipmentItems
    }
  }
  ${shipmentFragments.shipmentItems}
`;

export const DELETE_SHIPMENT_ITEM = gql`
  mutation deleteShipmentItem($input: DeleteShipmentItemInput) {
    deleteShipmentItem(input: $input) {
      id
      ...shipmentItems
      hasItems
    }
  }
  ${shipmentFragments.shipmentItems}
`;
