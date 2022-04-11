import gql from "graphql-tag";

export const GET_ANALYSES = gql`
  query getAnalysesOverview($viewKey: String!) {
    analyses: getAnalysesOverview(viewKey: $viewKey) {
      id
      name
      type
      created {
        at
      }
    }
  }
`;

export const CREATE_ANALYSIS = gql`
  mutation createAnalysis($input: createAnalysisInput!) {
    createAnalysis(input: $input)
  }
`;
