import gql from "graphql-tag";

export const fragments = {
  TenderBidDataGrid: gql`
    fragment TenderBidDataGrid on TenderBidDataResult {
      id
      data {
        lineId
        tenderBidId
        rowData
      }
      stats {
        totalCount
        queryCount
        curCount
      }
      headerDefs {
        label
        key
        cKey
        dataKey
        cType
        group
        edit
        isFoldKey
      }
    }
  `
};
