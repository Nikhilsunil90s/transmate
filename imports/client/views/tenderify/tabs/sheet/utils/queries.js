import gql from "graphql-tag";
import { fragments as tenderBidDataFragments } from "/imports/api/tender-bids-data/apollo/fragments";
import { fragments as tenderBidFragments } from "/imports/api/tender-bids/apollo/fragments";

export const GET_TENDER_BID_DATA_GRID = gql`
  query getTenderBidDataGrid($input: getTenderBidDataGridInput!) {
    gridData: getTenderBidDataGrid(input: $input) {
      ...TenderBidDataGrid
    }
  }
  ${tenderBidDataFragments.TenderBidDataGrid}
`;

export const GET_TENDER_BID_PROGRESS = gql`
  query getTenderBidProgress($tenderBidId: String!) {
    getTenderBid(tenderBidId: $tenderBidId) {
      id
      ...tenderBidWorker
    }
  }
  ${tenderBidFragments.tenderBidWorker}
`;

export const UPDATE_TENDER_BID_DATA_GRID = gql`
  mutation updateTenderBidDataGrid($input: updateTenderBidDataGridInput!) {
    updateTenderBidDataGrid(input: $input) {
      lineId
      tenderBidId
      rowData
    }
  }
`;

export const GENERATE_GRID_DATA_FROM_PRICELIST = gql`
  mutation generateTenderBidDataGridFromPriceList(
    $input: generateTenderBidDataGridFromPriceListInput!
  ) {
    generateTenderBidDataGridFromPriceList(input: $input) {
      id
      ...tenderBidWorker
    }
  }
  ${tenderBidFragments.tenderBidWorker}
`;

export const RESET_GRID_DATA = gql`
  mutation resetTenderBidDataGrid($input: resetTenderBidDataGridInput!) {
    resetTenderBidDataGrid(input: $input)
  }
`;

export const INSERT_CALCULATION_COLUMN = gql`
  mutation insertCalculationColumnTenderBidDataGrid(
    $input: InsertCalculationColumnTenderBidDataGridInput!
  ) {
    insertCalculationColumnTenderBidDataGrid(input: $input)
  }
`;

export const GET_FILTER_VALUES = gql`
  query getTenderBidDataFilterValues(
    $input: GetTenderBidDataFilterValuesInput!
  ) {
    filterValues: getTenderBidDataFilterValues(input: $input) {
      tenderBidId
      key
      values
    }
  }
`;
