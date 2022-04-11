import gql from "graphql-tag";
import { fragments as documentFragments } from "/imports/api/documents/apollo/fragments";

export const uomConversion = gql`
  fragment uomConversion on UOMConversion {
    from {
      uom
      range {
        from
        to
      }
    }
    to {
      uom
      multiplier
      fixed
      min
      max
    }
  }
`;

export const fragments = {
  uomConversion,
  priceListCore: gql`
    fragment priceListCore on PriceList {
      id
      title
      currency
      status
      creatorId
      carrierId
      carrier {
        id
        name
        logo
      }
      customerId
      customer {
        id
        name
      }
      category
      mode
      type
      terms {
        condition
        days
      }
      validFrom
      validTo
      created {
        at
        by
      }
    }
  `,
  priceListExtra: gql`
    fragment priceListExtra on PriceList {
      notes
      carrierName # in use?
      rules
      summary {
        laneCount
        rangesCount
        rateCount
      }
      template {
        masterTemplateId
        structure
        type
      }
      uoms {
        allowed
        conversions {
          ...uomConversion
        }
      }
    }
    ${uomConversion}
  `,
  priceListUOMS: gql`
    fragment priceListUOMS on PriceList {
      uoms {
        allowed
        conversions {
          ...uomConversion
        }
      }
    }
    ${uomConversion}
  `,
  priceListCharges: gql`
    fragment priceListCharges on PriceList {
      charges {
        comment
        currency
        costId
        id
        max
        meta
        min
        multiplier
        name
        type
        volumeRangeIndex
      }
    }
  `,
  priceListLanes: gql`
    fragment priceListLanes on PriceList {
      lanes {
        from {
          addressIds
          locationIds
          zones {
            CC
            from
            to
          }
        }
        id
        incoterm
        name
        stops {
          addressId
          locationId
          type
        }
        to {
          addressIds
          locationIds
          zones {
            CC
            from
            to
          }
        }
        triggersRules
      }
    }
  `,
  priceListVolumes: gql`
    fragment priceListVolumes on PriceList {
      volumes {
        id
        name
        ranges {
          from
          id
          multiplier
          name
          to
          triggersRules
        }
        serviceLevel
        triggersRules
        uom
      }
    }
  `,
  priceListEquipments: gql`
    fragment priceListEquipments on PriceList {
      equipments {
        id
        name
        triggersRules
        types
      }
    }
  `,
  priceListLeadTimes: gql`
    fragment priceListLeadTimes on PriceList {
      defaultLeadTime {
        days
        frequency
        leadTimeHours
      }
      leadTimes {
        days
        frequency
        lane {
          from
          name
          to
        }
        leadTimeHours
        rules
      }
    }
  `,
  priceListShipments: gql`
    fragment priceListShipments on PriceList {
      shipments {
        params
        reference
        shipmentId
      }
    }
  `,
  priceListAttachments: gql`
    fragment priceListAttachments on PriceList {
      attachments {
        ...documentBase
      }
    }
    ${documentFragments.documentBase}
  `,
  priceListUpdates: gql`
    fragment priceListUpdates on PriceList {
      updates {
        accountId
        action
        links
        ts
        userId
      }
    }
  `,
  rateFragment: gql`
    fragment rateFragment on PriceListRate {
      id
      priceListId
      costId
      laneId
      type
      name
      amount {
        value
        unit
        on
      }
      multiplier
      min
      max
      rules
      rulesUI
      filters
      calculation {
        formula
      }
      comment
      meta {
        source
        color
        leg
        type
      }
    }
  `,

  manualLookupResponse: gql`
    fragment manualLookupResponse on PriceLookupResponse {
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
            id
            costId
            name
            amount {
              unit
              value
            }
            multiplier
            min
            max
            comment
            tooltip
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
        status
        title
        totalCost
        validFrom
        validTo
      }
      errors
    }
  `
};
