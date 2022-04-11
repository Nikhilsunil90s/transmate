import gql from "graphql-tag";

export const fragments = {
  switchPointBase: gql`
    fragment switchPointBase on AnalysisSwitchPoint {
      id
      analysisId
      name
      accountId
      created {
        by
        at
      }
      params
      intervals
      priceListIds
      lanes
    }
  `
};
