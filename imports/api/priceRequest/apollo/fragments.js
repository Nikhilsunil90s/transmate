import { gql } from "@apollo/client";

export const fragments = {
  priceRequestBase: gql`
    fragment priceRequestBase on PriceRequest {
      id
      title
      customerId
      creatorId
      requestedBy
      type
      status
      currency
      dueDate
      notes

      requirements
      # {
      #   customsClearance
      #   freeDays {
      #     condition
      #     demurrage
      #     detention
      #   }
      # }

      # projections:
      customer {
        id
        name
      }
    }
  `,
  priceRequestSettings: gql`
    fragment priceRequestSettings on PriceRequest {
      settings {
        templateId
        templateSettings
      }
    }
  `,
  priceRequestBidders: gql`
    fragment priceRequestBidders on PriceRequest {
      bidders {
        accountId
        name
        notified
        won
        lost
        viewed
        bid
        bidOpened
        priceListId
        userIds
        firstSeen
        lastSeen
        simpleBids {
          shipmentId
          date
          won
          lost
          chargeLines {
            chargeId
            name
            costId
            amount {
              value
              unit
            }
            comment
          }
          settings
          offered
          notes
        }
        contacts {
          contactType
          type
          firstName
          lastName
          phone
          mail
          token
          linkedId
          userId
          events {
            event
            timestamp
          }
        }
      }
    }
  `,
  priceRequestInsights: gql`
    fragment priceRequestInsights on PriceRequest {
      # projected fields:
      requester
      requestedByName
      partners
      biddersInRequest
      bids
      customerName
      wons
      ref
      bid
      won
      lost
    }
  `,
  priceRequestItems: gql`
    fragment priceRequestItems on PriceRequest {
      items {
        shipmentId
        number
        params
      }
    }
  `,
  priceRequestAnalysis: gql`
    fragment priceRequestAnalysis on PriceRequest {
      id
      analyseData
      calculation
    }
  `
};
