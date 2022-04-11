import gql from "graphql-tag";
import { fragments as documentFragments } from "/imports/api/documents/apollo/fragments";

export const fragments = {
  tenderBase: gql`
    fragment tenderBase on Tender {
      id
      number
      title
      status
      steps
      notes {
        introduction
        procedure
      }
      accountId
      contacts {
        userId
        role
      }
      requirements {
        id
        type
        title
        details
        responseType
        responseOptions
      }

      params {
        bid {
          types
          priceListId
        }
        query
        NDA {
          required
          type
          documentId
        }
      }
      calculation {
        status
        type
        message
        result
      }
      timeline {
        title
        details
        date
      }
      scope
      FAQ {
        title
        details
      }
      activity {
        generateScope
        calculating
      }
      created {
        by
        at
      }
      updated {
        by
        at
      }
      released {
        by
        at
      }

      # projected fields:
      isOwner
      isBidder
    }
  `,
  tenderPackages: gql`
    fragment tenderPackages on Tender {
      packages {
        pickupCountry
        bidGroups {
          id
          pickupCountry
          pickupZip
          pickupLocode
          pickupName
          deliveryCountry
          deliveryZip
          deliveryLocode
          deliveryName
          equipment
          # DG
          # DG class
          # conditions
          shipmentIds
          quantity {
            scopeCount
            shipCount
            totalAmount
            avgAmount
            minAmount
            maxAmount
            stdevAmount
            currentAvgLeadtime
          }
        }
      }
    }
  `,
  tenderBidder: gql`
    fragment tenderBidder on TenderBiddersType {
      accountId
      name
      contacts {
        contactType
        type
        firstName
        lastName
        phone
        mail
        linkedId
        userId
        events {
          event
          timestamp
        }
      }
      bids
      requirements {
        id
        responseStr
        responseBool
      }
      priceLists {
        id
        title
      }
      documents {
        id
        name
      }
      NDAresponse {
        accepted
        doc
        ts {
          by
          at
        }
      }
      firstSeen
      lastSeen
      bid
    }
  `,
  tenderBidders: gql`
    fragment tenderBidders on Tender {
      bidders {
        accountId
        name
        contacts {
          contactType
          type
          firstName
          lastName
          phone
          mail
          linkedId
          userId
          events {
            event
            timestamp
          }
        }
        bids
        requirements {
          id
          responseStr
          responseBool
        }
        priceLists {
          id
          title
        }
        documents {
          id
          name
        }
        NDAresponse {
          accepted
          doc
          ts {
            by
            at
          }
        }
        firstSeen
        lastSeen
        notified
        userIds
      }
    }
  `,
  tenderDocuments: gql`
    fragment tenderDocuments on Tender {
      documents {
        ...documentMinimal
      }
    }
    ${documentFragments.documentMinimal}
  `
};
