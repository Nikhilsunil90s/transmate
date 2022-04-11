import { gql } from "@apollo/client";

export const SHIPMENT_PRICE_LOOKUP = gql`
  query getPriceLookupShipment($input: ShipmentPriceLookupInput!) {
    results: getPriceLookupShipment(input: $input) {
      audits {
        count
        step
        msg
      }
      calculationParams
      costs {
        id
        bestCost
        bestLeadTime
        calculation
        carrierId
        carrierName
        category
        costs {
          rate {
            costId
            # FIXME double check this and remove the comments
            meta {
              source
              color
              leg
              type
            }
            tooltip
            name
            amount {
              unit
              value
            }
          }
          total {
            convertedCurrency
            convertedValue
            exchange
            listCurrency
            listValue
          }
        }
        customerId
        leadTime {
          definition
          hours
        }
        mode
        priceRequestId
        biddingNotes
        priceRequest {
          notes
          #don't request the Id or it will chage notes per id (to be tested futher)
        }
        status
        title
        totalCost
        validFrom
        validTo
      }
      errors
    }
  }
`;
