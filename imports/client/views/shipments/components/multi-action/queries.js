import { gql } from "@apollo/client";
import { fragments as priceRequestFragments } from "/imports/api/priceRequest/apollo/fragments";

export const MASS_ACTION = gql`
  mutation massActionShipment($input: ShipmentMassActionInput!) {
    response: massActionShipment(input: $input) {
      success
      errors
      newIds
    }
  }
`;

export const CREATE_PRICE_REQUEST = gql`
  mutation createPriceRequestMassAction(
    $type: PRICE_REQUEST_TYPE
    $dueDate: Date
    $title: String
    $items: [PriceRequestItemInput]
  ) {
    result: createPriceRequest(
      type: $type
      dueDate: $dueDate
      title: $title
      items: $items
    ) {
      priceRequestId
      priceRequest {
        ...priceRequestBase
      }
      errors
      validItems
      shipments {
        id
        priceRequestId
        links {
          id
          type
          data
        }
      }
    }
  }
  ${priceRequestFragments.priceRequestBase}
`;

export const ADD_ITEMS_TO_PRICE_REQUEST = gql`
  mutation addItemsToRequest($input: addItemsToRequestInput) {
    result: addItemsToRequest(input: $input) {
      priceRequestId
      priceRequest {
        ...priceRequestBase
      }
      errors
      validItems
      shipments {
        id
        priceRequestId
        links {
          id
          type
          data
        }
      }
    }
  }
  ${priceRequestFragments.priceRequestBase}
`;
