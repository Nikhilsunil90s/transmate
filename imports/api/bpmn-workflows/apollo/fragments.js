import gql from "graphql-tag";

export const fragments = {
  workflowBase: gql`
    fragment workflowBase on Workflow {
      id
      name
      status
      created {
        by
        at
      }
    }
  `
};
