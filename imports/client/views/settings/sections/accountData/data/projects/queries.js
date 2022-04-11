import { gql } from "@apollo/client";

export const INITIALIZE_YEAR_FOR_CODE = gql`
  mutation initYearForProjectCode($input: ProjectCodeYearInitInput!) {
    response: initYearForProjectCode(input: $input) {
      shipmentIds
      projectIds
    }
  }
`;
