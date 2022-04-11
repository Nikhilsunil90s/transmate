import gql from "graphql-tag";
import { fragments as priceListFragments } from "/imports/api/pricelists/apollo/fragments";

export const CREATE_PRICELIST = gql`
  mutation createPriceList($input: CreatePriceListInput) {
    createPriceList(input: $input) {
      ...priceListCore
    }
  }
  ${priceListFragments.priceListCore}
`;

export const DUPLICATE_PRICELIST = gql`
  mutation duplicatePriceList($input: DuplicatePriceListInput!) {
    duplicatePriceList(input: $input) {
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

export const GET_PRIE_VIEW_LIST_QUERY = gql`
  query getPriceViewListQuery($input: PriceViewListInput!) {
    getPriceViewList(input: $input) {
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

export const SAVE_PRICE_LIST_STATUS = gql`
  mutation setPriceListStatusInOverview($input: SetPriceListStatusInput!) {
    setPriceListStatus(input: $input) {
      id
      status
    }
  }
`;
