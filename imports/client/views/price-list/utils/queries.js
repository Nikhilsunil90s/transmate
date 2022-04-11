import gql from "graphql-tag";
import { fragments as priceListFragments } from "/imports/api/pricelists/apollo/fragments";
import { fragments as documentFragments } from "/imports/api/documents/apollo/fragments";
import { fragments as fuelFragments } from "/imports/api/fuel/apollo/fragments";

export const GET_PRICELIST = gql`
  query getPriceListPage($priceListId: String!) {
    priceList: getPriceList(priceListId: $priceListId) {
      ...priceListCore
      ...priceListLanes
      ...priceListVolumes
      ...priceListEquipments
      ...priceListCharges
      ...priceListShipments
      ...priceListLeadTimes
      ...priceListAttachments
      ...priceListExtra
      ...priceListUpdates

      priceRequestId
      fuelIndexId
      tenderId

      # projections:
      expired
    }
  }
  ${priceListFragments.priceListCore}
  ${priceListFragments.priceListCharges}
  ${priceListFragments.priceListLanes}
  ${priceListFragments.priceListVolumes}
  ${priceListFragments.priceListEquipments}
  ${priceListFragments.priceListLeadTimes}
  ${priceListFragments.priceListShipments}
  ${priceListFragments.priceListAttachments}
  ${priceListFragments.priceListExtra}
  ${priceListFragments.priceListUpdates}
`;

export const GET_PRICELIST_ASIDE = gql`
  query getPriceListAside($priceListId: String!) {
    priceList: getPriceList(priceListId: $priceListId) {
      ...priceListCore
    }
  }
  ${priceListFragments.priceListCore}
`;

export const GET_PRICELIST_RATES = gql`
  query getPriceListRates(
    $priceListId: String!
    $query: GetPriceListRateQueryInput!
    $inGrid: Boolean
  ) {
    results: getPriceListRates(
      priceListId: $priceListId
      query: $query
      inGrid: $inGrid
    ) {
      rates {
        ...rateFragment
      }
      stats {
        totalCount
        queryCount
        curCount
      }
    }
  }
  ${priceListFragments.rateFragment}
`;

export const SAVE_PRICE_LIST = gql`
  mutation updatePriceList($input: UpdatePriceListInput!) {
    updatePriceList(input: $input) {
      ...priceListCore
      ...priceListCharges
      ...priceListLanes
      ...priceListVolumes
      ...priceListEquipments
      ...priceListLeadTimes
      ...priceListExtra
      ...priceListUpdates

      expired
    }
  }
  ${priceListFragments.priceListCore}
  ${priceListFragments.priceListCharges}
  ${priceListFragments.priceListLanes}
  ${priceListFragments.priceListVolumes}
  ${priceListFragments.priceListEquipments}
  ${priceListFragments.priceListLeadTimes}
  ${priceListFragments.priceListExtra}
  ${priceListFragments.priceListUpdates}
`;

export const UPDATE_PRICE_LIST_CONVERSION = gql`
  mutation updatePriceListConversions(
    $input: UpdatePriceListConversionsInput!
  ) {
    updatePriceListConversions(input: $input) {
      id
      uoms {
        allowed
        conversions
      }
    }
  }
`;

export const SAVE_PRICE_LIST_STATUS = gql`
  mutation setPriceListStatus($input: SetPriceListStatusInput!) {
    setPriceListStatus(input: $input) {
      id
      status
    }
  }
`;

export const GET_MY_FUEL_INDEXES = gql`
  query getFuelIndexesForPriceList {
    fuelIndexes: getFuelIndexes {
      id
      name
    }
  }
`;

export const GET_FUEL_INDEX = gql`
  query getFuelIndexForPriceList($fuelIndexId: String!) {
    fuelIndex: getFuelIndex(fuelIndexId: $fuelIndexId) {
      id
      name
      accountId
      created {
        by
        at
      }
      name
      description
      fuel
      acceptance
      costId
      base {
        rate
        month
        year
      }
      periods {
        month
        year
        index
        fuel
      }
    }
  }
`;

export const REMOVE_ATTACHMENT = gql`
  mutation removeAttachment($input: UpdatePriceListAttachmentInput!) {
    removeAttachment(input: $input) {
      ...documentBase
    }
  }
  ${documentFragments.documentBase}
`;

export const ADD_ATTACHMENT = gql`
  mutation addAttachment($input: UpdatePriceListAttachmentInput!) {
    addAttachment(input: $input) {
      ...documentBase
    }
  }
  ${documentFragments.documentBase}
`;

export const SAVE_PRICELIST_RATE_GRID = gql`
  mutation updatePriceListRatesGrid(
    $priceListId: String!
    $updates: [PriceListRateGridUpdate]
  ) {
    updatePriceListRatesGrid(priceListId: $priceListId, updates: $updates)
  }
`;

export const UPDATE_RATE_IN_LIST = gql`
  mutation updatePriceListRate($input: PriceListRateUpdate) {
    updatePriceListRate(input: $input) {
      ...rateFragment
    }
  }
  ${priceListFragments.rateFragment}
`;

export const COPY_ADITIONAL_CHARGES_FROM_OTHER_PRICELIST = gql`
  mutation copyPriceListAdditionalRates(
    $input: CopyPriceListAdditionalRatesInput!
  ) {
    copyPriceListAdditionalRates(input: $input) {
      ...rateFragment
    }
  }
  ${priceListFragments.rateFragment}
`;

export const COPY_LEADTIME_LANES = gql`
  mutation priceListLeadTimesCopyLanes($priceListId: String!) {
    priceListLeadTimesCopyLanes(priceListId: $priceListId) {
      id
      leadTimes {
        leadTimeHours
        days
        frequency
        lane {
          name
          from
          to
        }
        rules
      }
    }
  }
`;

export const UPDATE_FUEL_INDEX = gql`
  mutation updatePriceListFuelIndex(
    $fuelIndexId: String!
    $priceListId: String!
  ) {
    updatePriceListFuelIndex(
      fuelIndexId: $fuelIndexId
      priceListId: $priceListId
    ) {
      priceList {
        id
        fuelIndexId
      }
      fuel {
        ...fuelBase
        ...fuelDetail
      }
    }
  }
  ${fuelFragments.fuelBase}
  ${fuelFragments.fuelDetail}
`;

export const COPY_CONVERSIONS_FROM_OTHER_PRICELIST = gql`
  mutation copyPriceListConversions($input: CopyPriceListConversionsInput!) {
    copyPriceListConversions(input: $input) {
      id
      ...priceListUOMS
    }
  }
  ${priceListFragments.priceListUOMS}
`;
