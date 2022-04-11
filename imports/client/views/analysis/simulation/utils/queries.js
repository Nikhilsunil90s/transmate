import gql from "graphql-tag";

export const GET_MY_PRICELISTS = gql`
  query getOwnPriceListsAnalysis($input: GetPriceListsInput!) {
    priceLists: getOwnPriceLists(input: $input) {
      id
      title
      carrierId
      carrierName
      type
      status
    }
  }
`;

export const SAVE_SIMULATION = gql`
  mutation simulationSaveUpdate($input: SimulationUpdateInput!) {
    simulationSaveUpdate(input: $input)
  }
`;

export const NEXT_STEP_SIMULATION = gql`
  mutation simulationNextStep($analysisId: String!, $nextStep: String) {
    simulationNextStep(analysisId: $analysisId, nextStep: $nextStep)
  }
`;

export const SIMULATION_START = gql`
  mutation simulationStart($analysisId: String!) {
    simulationStart(analysisId: $analysisId) {
      analysisId
      status
    }
  }
`;

export const SIMULATION_SAVE_PRICELISTS = gql`
  mutation simulationSavePriceLists($input: SimulationPriceListInput!) {
    simulationSavePriceLists(input: $input) {
      analysisId
      priceLists {
        id
        carrierId
        carrierName
        title
      }
    }
  }
`;

export const SIMULATION_SAVE_DETAIL = gql`
  mutation simulationSaveDetail(
    $analysisId: String!
    $updates: [SimulationDetailInput]!
  ) {
    simulationSaveDetail(analysisId: $analysisId, updates: $updates)
  }
`;
