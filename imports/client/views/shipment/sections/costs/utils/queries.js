import { gql } from "@apollo/client";
import { fragments as priceRequestFragments } from "/imports/api/priceRequest/apollo/fragments";

const fragments = {
  costDetail: gql`
    fragment CostDetailFragment on ShipmentCostAndInvoiceType {
      baseCurrency
      calculated {
        id
        costId
        source
        amount {
          value
          currency
          rate
        }
        added {
          by
          at
        }
        accountId
        sellerId
        invoiceId
        invoiced
        orgIndex
        description
        forApproval
        response {
          approved
          reason
          comment
          responded {
            by
            at
          }
        }
        isManualBaseCost

        tooltip
        priceListId
        sellerId
        date
        calculatedExchange
      }
      invoices {
        # invoiceId
        # FIXME double check this and remove the comments
        id

        number
        sellerId
        invoiceCurrency
        date
        subtotal
        costItems {
          id
          description
          amount {
            value
            currency
            rate
          }
          costId
          orgIndex
          source
          # FIXME double check this and remove the comments
          # isInvoice
          invoiceId
          invoiced
        }
      }
      totalShipmentCosts
      totalInvoiceCosts
      totalInvoiceDelta
    }
  `
};

export const GET_SHIPMENT_COSTS = gql`
  query getShipmentCostDetailsForShipmentCostSection($shipmentId: String!) {
    result: getShipmentCostDetails(shipmentId: $shipmentId) {
      id
      status
      carrierIds
      costDetail {
        ...CostDetailFragment
      }
    }
  }
  ${fragments.costDetail}
`;

export const RESET_SHIPMENT_COSTS = gql`
  mutation resetShipmentCosts($shipmentId: String!) {
    resetShipmentCosts(shipmentId: $shipmentId) {
      id
      status
      carrierIds
      costDetail {
        ...CostDetailFragment
      }
      priceRequestId
      links {
        id
        type
        data
      }
    }
  }
  ${fragments.costDetail}
`;

export const SELECT_CARRIER = gql`
  mutation selectShipmentCarrier(
    $shipmentId: String!
    $carrierId: String
    $priceListId: String
    $priceListResult: JSONObject
  ) {
    selectShipmentCarrier(
      shipmentId: $shipmentId
      carrierId: $carrierId
      priceListId: $priceListId
      priceListResult: $priceListResult
    ) {
      id
      status
      carrierIds
      carrier {
        id
        name
      }
      costDetail {
        ...CostDetailFragment
      }
    }
  }
  ${fragments.costDetail}
`;

export const CREATE_PRICE_REQUEST = gql`
  mutation createPriceRequest(
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

export const APPROVE_DECLINE_COSTS = gql`
  mutation approveDeclineShipmentCosts($input: ApproveDeclineInput!) {
    approveDeclineShipmentCosts(input: $input) {
      id
      costDetail {
        ...CostDetailFragment
      }
    }
  }
  ${fragments.costDetail}
`;

export const EDIT_SHIPMENT_COST = gql`
  mutation editShipmentCosts($input: UpdateShipmentCostInput!) {
    editShipmentCosts(input: $input) {
      id
      costDetail {
        ...CostDetailFragment
      }
    }
  }
  ${fragments.costDetail}
`;

export const GET_PRICE_REQUEST_SUMMARY = gql`
  query getPricerequestSummary($shipmentId: String!) {
    priceRequest: getPricerequestSummary(shipmentId: $shipmentId) {
      id
      customerId
      creatorId
      status
      dueDate

      # projection:
      bids
      biddersInRequest
    }
  }
`;

export const UPDATE_COST_PARAMS = gql`
  mutation updateShipmentCostParams(
    $shipmentId: String!
    $updates: JSONObject
  ) {
    updateShipment(shipmentId: $shipmentId, updates: $updates) {
      id
      costParams {
        entity
        currencyDate
        customsClearance
        freeDays
      }
      serviceLevel
    }
  }
`;
