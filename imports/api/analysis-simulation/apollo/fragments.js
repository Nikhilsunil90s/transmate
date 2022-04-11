import gql from "graphql-tag";

export const fragments = {
  simulationBase: gql`
    fragment simulationBase on AnalysisSimulation {
      id
      analysisId
      name
      steps
      created {
        by
        at
      }
      accountId
      params
      status
      scanning
      updated {
        by
        at
      }
      deleted
      scope
      priceLists {
        id
        carrierId
        carrierName
        title
      }
      worker
      aggregates
    }
  `
};
