import gql from "graphql-tag";
import { fragments as documentFragments } from "/imports/api/documents/apollo/fragments";
import { fragments as accountFragments } from "/imports/api/allAccounts/apollo/fragments";
import { fragments as stageFragments } from "/imports/api/stages/apollo/fragments";
import { fragments as itemFragments } from "/imports/api/items/apollo/fragments";
import { fragments as nonConformanceFragments } from "/imports/api/nonConformances/apollo/fragments";

export const fragments = {
  shipmentBase: gql`
    fragment shipmentBase on ShipmentAggr {
      number
      type
      serviceLevel
      incoterm
      status
      meta
      demo
      flags
      tags
      eta

      priceListId
      priceRequestId
      stageIds
      nonConformanceIds

      drivingDistance
      drivingDuration
      sphericalDistance
      created {
        by
        at
      }
      updated {
        by
        at
      }

      updates {
        action
        data
        accountId
        ts
        userId
      }

      # projections:
      isArchived
      canViewCosts
      hasItems
    }
  `,
  shipmentErrors: gql`
    fragment shipmentErrors on ShipmentAggr {
      errors {
        type
        data
        message
        dt
      }
    }
  `,
  shipmentStop: gql`
    fragment shipmentStop on ShipmentStopType {
      location {
        latLng {
          lat
          lng
        }
        countryCode
        isValidated
        zipCode
        addressId
        locode {
          id
          code
          name
          function
        }
        name
        companyName
        phoneNumber
        email
        address {
          street
          address1
          address2
          number
          city
          state
        }
        timeZone
        annotation
      }
      date

      # optionally here the datePlanned and dateActual
      datePlanned
      dateScheduled
      dateActual
    }
  `,
  shipmentNotes: gql`
    fragment shipmentNotes on ShipmentAggr {
      notes {
        BookingNotes
        PlanningNotes
        LoadingNotes
        UnloadingNotes
        OtherNotes
        TemperatureControl
      }
    }
  `,
  shipmentReferences: gql`
    fragment shipmentReferences on ShipmentAggr {
      references {
        number
        booking
        carrier
        consignee
        bof
        fa
        container
        cmr
      }
      trackingNumbers
    }
  `,
  shipmentDocuments: gql`
    fragment shipmentDocuments on ShipmentAggr {
      documents {
        ...documentMinimal
      }
    }
    ${documentFragments.documentMinimal}
  `,
  shipmentStakeholders: gql`
    fragment shipmentStakeholders on ShipmentAggr {
      plannerIds
      accountId
      account {
        ...accountBase
      }
      shipperId
      shipper {
        ...accountBase
      }
      carrier {
        ...accountBase
      }

      consigneeId
      consignee {
        ...accountBase
      }

      carrierIds
      providerIds
    }
    ${accountFragments.accountBase}
  `,
  shipmentStages: gql`
    fragment shipmentStages on ShipmentAggr {
      stages {
        ...stageComplete
      }
    }
    ${stageFragments.stageComplete}
  `,
  shipmentLinks: gql`
    fragment shipmentLinks on ShipmentAggr {
      links {
        id
        type
        data
      }
    }
  `,
  shipmentItems: gql`
    fragment shipmentItems on ShipmentAggr {
      nestedItems {
        id
        ...itemDetail
      }
    }
    ${itemFragments.itemDetail}
  `,
  shipmentCosts: gql`
    fragment shipmentCosts on ShipmentAggr {
      costParams {
        entity
        customsClearance
        freeDays
      }

      # costs....
    }
  `,
  shipmentNonConformances: gql`
    fragment shipmentNonConformances on ShipmentAggr {
      nonConformances {
        ...nonConformanceBase
      }
    }
    ${nonConformanceFragments.nonConformanceBase}
  `,
  shipmentUpdates: gql`
    fragment shipmentUpdates on ShipmentAggr {
      updates {
        action
        accountId
        userId
        data
        ts
      }
    }
  `,
  shipmentRequest: gql`
    fragment shipmentRequest on ShipmentAggr {
      request {
        requestedOn
        submittedOn
        by
        accountId
        status
      }
    }
  `
};

fragments.shipmentComplete = gql`
  fragment shipmentComplete on ShipmentAggr {
    id
    ...shipmentBase
    access {
      accountId
    }
    pickup {
      ...shipmentStop
    }
    delivery {
      ...shipmentStop
    }
    ...shipmentStakeholders
    ...shipmentReferences

    ...shipmentNotes
    ...shipmentStages
    ...shipmentLinks
    ...shipmentDocuments
    ...shipmentItems
    ...shipmentCosts
    ...shipmentNonConformances
  }
  ${fragments.shipmentBase}
  ${fragments.shipmentStop}
  ${fragments.shipmentReferences}
  ${fragments.shipmentLinks}
  ${fragments.shipmentNotes}
  ${fragments.shipmentStakeholders}
  ${fragments.shipmentStages}
  ${fragments.shipmentDocuments}
  ${fragments.shipmentItems}
  ${fragments.shipmentCosts}
  ${fragments.shipmentNonConformances}
`;
