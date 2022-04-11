import gql from "graphql-tag";
import { fragments as switchPointFragments } from "/imports/api/analysis-switchpoint/apollo/fragments";

export const GENERATE_LANES = gql`
  mutation switchPointGenerateLanes($input: switchPointGenerateLanesInput!) {
    switchPointGenerateLanes(input: $input) {
      id
      lanes
    }
  }
`;

export const UPDATE_SWITCHPOINT = gql`
  mutation updateSwitchPoint($input: UpdateSwitchPointInput!) {
    updateSwitchPoint(input: $input) {
      ...switchPointBase
    }
  }
  ${switchPointFragments.switchPointBase}
`;
