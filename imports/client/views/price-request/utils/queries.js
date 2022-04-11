import gql from "graphql-tag";
import { fragments as itemFragments } from "/imports/api/items/apollo/fragments";
import { fragments as priceRequestFragments } from "/imports/api/priceRequest/apollo/fragments";
import { fragments as shipmentFragments } from "/imports/api/shipments/apollo/fragments";

export const GET_PRICE_REQUEST = gql`
  query getPriceRequestForPage($priceRequestId: String!) {
    priceRequest: getPriceRequest(priceRequestId: $priceRequestId) {
      ...priceRequestBase
      ...priceRequestSettings
      ...priceRequestBidders
      ...priceRequestInsights
      ...priceRequestItems
    }
  }
  ${priceRequestFragments.priceRequestBase}
  ${priceRequestFragments.priceRequestSettings}
  ${priceRequestFragments.priceRequestBidders}
  ${priceRequestFragments.priceRequestInsights}
  ${priceRequestFragments.priceRequestItems}
`;

export const UPDATE_PRICE_REQUEST = gql`
  mutation updatePriceRequest($input: UpdatePriceRequestInput!) {
    updatePriceRequest(input: $input) {
      ...priceRequestBase
    }
  }
  ${priceRequestFragments.priceRequestBase}
`;

export const UPDATE_PRICE_REQUEST_STATUS = gql`
  mutation updatePriceRequestStatus($input: UpdatePriceRequestStatusInput!) {
    updatePriceRequestStatus(input: $input) {
      id
      status
    }
  }
`;

export const ADD_MATCHING_BIDDERS = gql`
  mutation addMatchingBiddersPriceRequest($priceRequestId: String!) {
    addMatchingBiddersPriceRequest(priceRequestId: $priceRequestId) {
      priceRequest {
        id
        ...priceRequestBidders
        biddersInRequest
      }
      suggestedCarriers
      bestPartners
      selectedPartners
    }
  }
  ${priceRequestFragments.priceRequestBidders}
`;

export const POSTPONE_DEADLINE = gql`
  mutation postponePriceRequest($input: PostponePriceRequestInput!) {
    postponePriceRequest(input: $input) {
      id
      dueDate
    }
  }
`;

export const UPDATE_BIDDER_TS = gql`
  mutation updateBidderTSPriceRequest($priceRequestId: String!) {
    updateBidderTSPriceRequest(priceRequestId: $priceRequestId)
  }
`;

export const UPDATE_BIDDERS = gql`
  mutation updatePriceRequestBidders($input: updatePriceRequestBiddersInput!) {
    updatePriceRequestBidders(input: $input) {
      priceRequest {
        id
        ...priceRequestBidders
      }
      accountsAdded
      accountsRemoved
      errors
    }
  }
  ${priceRequestFragments.priceRequestBidders}
`;

export const GET_PRICE_REQUEST_ITEMS = gql`
  query getPriceRequestItems($priceRequestId: String!) {
    items: getPriceRequestItems(priceRequestId: $priceRequestId) {
      id
      number
      deliveryDate
      pickup {
        ...shipmentStop
      }
      pickupDate
      delivery {
        ...shipmentStop
      }
      shipper {
        name
        id
        annotation {
          coding
        }
      }
      references {
        container
        number
        booking
      }
      nestedItems {
        id
        ...itemDetail
      }
      stageCount
    }
  }
  ${itemFragments.itemDetail}
  ${shipmentFragments.shipmentStop}
`;

export const GET_SHIPMENT_BY_ID_MINIMAL = gql`
  query getShipmentByIdForMinimalDisplay($shipmentId: String!) {
    shipment: getShipmentById(shipmentId: $shipmentId) {
      id
      number
      references {
        container
        number
        booking
      }
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

export const PLACE_SIMPLE_BID = gql`
  mutation placeSimpleBidPriceRequest(
    $input: PlaceSimpleBidPriceRequestInput!
  ) {
    placeSimpleBidPriceRequest(input: $input) {
      id
      ...priceRequestBidders
      ...priceRequestInsights
    }
  }
  ${priceRequestFragments.priceRequestBidders}
  ${priceRequestFragments.priceRequestInsights}
`;

export const EDIT_BID = gql`
  mutation editBidPriceRequest($input: EditBidPriceRequestInput!) {
    editBidPriceRequest(input: $input) {
      id
      status
    }
  }
`;

export const GET_ANALYTIC_DATA = gql`
  query getPriceRequestInsights($priceRequestId: String!) {
    insights: getPriceRequestInsights(priceRequestId: $priceRequestId) {
      id
      ...priceRequestAnalysis
    }
  }
  ${priceRequestFragments.priceRequestAnalysis}
`;
