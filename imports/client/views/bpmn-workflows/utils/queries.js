import gql from "graphql-tag";
import { fragments as workflowFragments } from "/imports/api/bpmn-workflows/apollo/fragments";

export const GET_WORKFLOWS = gql`
  query getWorkflows($input: getWorkflowsInput!) {
    workflows: getWorkflows(input: $input) {
      ...workflowBase
    }
  }
  ${workflowFragments.workflowBase}
`;
