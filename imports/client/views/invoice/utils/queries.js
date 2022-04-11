import gql from "graphql-tag";
import { fragments as shipmentFragments } from "/imports/api/shipments/apollo/fragments";

export const GET_INVOICE = gql`
  query getInvoice($invoiceId: String!) {
    invoice: getInvoice(invoiceId: $invoiceId) {
      id
      clientId
      creatorId
      sellerId
      status
      date
      number
      amount {
        value
        currency
      }
      costs {
        code
        description
        costId
      }
      importId
      hasUpload

      # calculated & projected fields:
      itemCount
      client {
        id
        name
      }
      seller {
        id
        name
      }
      invoiceCurrency

      shipments {
        shipmentId
        invoiceItemId
        number
        invoice {
          base
          fuel
          total
          hasUnmappedCosts
          fuelPct
          exchangeDate
        }
        calculated {
          base
          additional
          fuel
          total
          hasUnmappedCosts
          fuelPct
          exchangeDate
        }
        hasCosts
        hasInvoiceCosts
        dateMatch {
          match
          invExchDate
          shipExchDate
        }
        delta
        deltaFuelPct
      }
      totals {
        dateMismatch
        invHasCostCount
        shipHasCostCount
        largeDeltaCount
        shipCount
        shipment {
          base
          fuel
          total
        }
        invoice {
          base
          fuel
          total
        }
        delta
      }
    }
  }
`;

export const GET_UNINVOICED_SHIPMENTS = gql`
  query getShipmentsWithoutInvoice($invoiceId: String!) {
    shipments: getShipmentsWithoutInvoice(invoiceId: $invoiceId) {
      id
      number
      costs {
        id
        costId
        description
        tooltip
        source
        calculatedExchange
        priceListId
        invoiced
        invoiceId
        amount {
          value
          currency
          rate
          currencyDate
        }
        added {
          by
          at
        }
        accountId
        sellerId
        date
        forApproval
      }
      references {
        number
        carrier
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

export const ADD_SHIPMENT_COST_ITEMS = gql`
  mutation addShipmentCostItems($input: AddShipmentCostItemInput) {
    addShipmentCostItems(input: $input)
  }
`;

export const GET_SHIPMENT_COST_DETAIL = gql`
  query getShipmentCostDetailsForInvoice($shipmentId: String!) {
    costDetails: getShipmentCostDetails(shipmentId: $shipmentId) {
      accountId # for security check
      status # for security check
      costDetail {
        baseCurrency
        calculated {
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
          id
          invoiceId
          invoiced
          orgIndex
          description
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
            invoiceId
            invoiced
          }
        }
        totalShipmentCosts
        totalInvoiceCosts
        totalInvoiceDelta
      }
    }
  }
`;

export const RESET_COST_MAPPING = gql`
  mutation resetInvoiceCostMapping($invoiceId: String!) {
    resetInvoiceCostMapping(invoiceId: $invoiceId) {
      id
      costs {
        code
        description
        costId
      }
    }
  }
`;

export const MAP_INVOICE_COSTS = gql`
  mutation mapInvoiceCosts($input: MapInvoiceCostInput!) {
    mapInvoiceCosts(input: $input) {
      id
      costs {
        code
        description
        costId
      }
    }
  }
`;

export const RESET_EXCHANGE_RATES = gql`
  mutation resetCurrencyExchangeRatesFromInvoice(
    $input: ResetCurrencyExchangeRatesInput!
  ) {
    resetCurrencyExchangeRatesFromInvoice(input: $input)
  }
`;

export const GET_INVOICE_REPORT = gql`
  query getInvoiceReport($query: GetInvoiceReportInput!) {
    getInvoiceReport(query: $query) {
      result
    }
  }
`;

// TODO: field selection after updating invoice
export const UPDATE_INVOICE = gql`
  mutation updateInvoice($input: UpdateInvoiceInput!) {
    updateInvoice(input: $input) {
      id
    }
  }
`;
