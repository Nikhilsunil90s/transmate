import gql from "graphql-tag";

export const GET_BILLING_INFO = gql`
  query getShipmentBillingInfo($shipmentId: String!) {
    billingInfo: getShipmentBillingInfo(shipmentId: $shipmentId) {
      id
      totals {
        base
        fuel
        additional
        manual
        total
        orgCurrency
        targetCurrency
      }
      billing {
        currency
        items {
          description
          amount
          invoiceId
          isFreight
        }
      }
    }
  }
`;
