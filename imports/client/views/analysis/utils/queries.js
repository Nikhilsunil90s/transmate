import gql from "graphql-tag";
import { fragments as switchPointFragments } from "/imports/api/analysis-switchpoint/apollo/fragments";
import { fragments as simulationFragments } from "/imports/api/analysis-simulation/apollo/fragments";

export const GET_ANALYSIS = gql`
  query getAnalysisForPage($analysisId: String!) {
    analysis: getAnalysis(analysisId: $analysisId) {
      id
      name
      type

      #projections:
      simulation {
        ...simulationBase
      }
      switchPoint {
        ...switchPointBase
      }
    }
  }
  ${simulationFragments.simulationBase}
  ${switchPointFragments.switchPointBase}
`;
