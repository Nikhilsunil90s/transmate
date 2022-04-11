import gql from "graphql-tag";
import { uomConversion } from "/imports/api/pricelists/apollo/fragments";

const tenderBidTenderInfo = gql`
  fragment tenderBidTenderInfo on TenderBid {
    tender {
      stage
      receivedDate
      dueDate
      currentRound
      totalRounds
      volume
      volumeUOM
      revenue {
        value
        currency
      }
    }
  }
`;

const tenderBidOfferItem = gql`
  fragment tenderBidOfferItem on TenderBidOfferItem {
    version
    ts
    validFrom
    validTo
    file
  }
`;

const tenderBidDocument = gql`
  fragment tenderBidDocument on DocumentType {
    id
    icon
    url
    meta {
      type
      name
    }
    store {
      url
    }
  }
`;
const tenderBidPartner = gql`
  fragment tenderBidPartner on TenderBid {
    partner {
      id
      name
      management {
        segment
        accountNumbers
        internalContacts {
          userId
          role
        }
      }
      contacts {
        contactType
        type
        firstName
        lastName
        phone
        mail
        userId
      }
    }
  }
`;
const tenderBidControl = gql`
  fragment tenderBidControl on TenderBid {
    bidControl {
      priceLists
      itemCount
      offeredCount
      emptyCount
      errors
    }
  }
`;

const tenderBidWorker = gql`
  fragment tenderBidWorker on TenderBid {
    worker {
      isRunning
      action
      current
      total
    }
  }
`;

const tenderBidSettings = gql`
  fragment tenderBidSettings on TenderBid {
    settings {
      priceListIds
      conversions {
        ...uomConversion
      }
    }
  }
  ${uomConversion}
`;

export const fragments = {
  tenderBidTenderInfo,
  tenderBidOfferItem,
  tenderBidDocument,
  tenderBidPartner,
  tenderBidControl,
  tenderBidWorker,
  tenderBidSettings,
  tenderBidBase: gql`
    fragment tenderBidBase on TenderBid {
      id
      name
      number
      status
      accountId

      source {
        type
        documents {
          ...tenderBidDocument
        }
      }
      contacts {
        role
        userId
      }

      ...tenderBidTenderInfo
      ...tenderBidPartner
      ...tenderBidControl
      ...tenderBidWorker
      ...tenderBidSettings

      offer {
        latest {
          ...tenderBidOfferItem
        }
        history {
          ...tenderBidOfferItem
        }
      }

      updates {
        action
        data
        ts
        userId
      }
      created {
        by
        at
      }
    }
    ${tenderBidControl}
    ${tenderBidPartner}
    ${tenderBidOfferItem}
    ${tenderBidDocument}
    ${tenderBidTenderInfo}
    ${tenderBidWorker}
    ${tenderBidSettings}
  `,
  tenderBidSideBar: gql`
    fragment tenderBidSideBar on TenderBid {
      id
      partner {
        id
        name
        management {
          segment
        }
      }
      ...tenderBidTenderInfo
      ...tenderBidControl
      ...tenderBidSettings
      offer {
        latest {
          ...tenderBidOfferItem
        }
      }
    }
    ${tenderBidTenderInfo}
    ${tenderBidOfferItem}
    ${tenderBidControl}
    ${tenderBidSettings}
  `,
  tenderBidOffer: gql`
    fragment tenderBidOffer on TenderBid {
      id
      offer {
        latest {
          ...tenderBidOfferItem
        }
        history {
          ...tenderBidOfferItem
        }
      }
    }
    ${tenderBidOfferItem}
  `
};
