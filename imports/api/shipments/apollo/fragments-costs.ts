import gql from "graphql-tag";

export const fragments = {
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
