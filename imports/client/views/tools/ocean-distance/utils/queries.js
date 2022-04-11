import gql from "graphql-tag";
import { fragments as toolsFragments } from "/imports/api/tools/apollo/fragments";

export const GET_OCEAN_DISTANCE = gql`
  mutation getOceanDistance($input: GetOceanDistanceInput!) {
    getOceanDistance(input: $input) {
      ...oceanDistanceResult
    }
  }
  ${toolsFragments.oceanDistanceResult}
`;

export const GET_USAGE = gql`
  query getUserActivityOceanDistance($input: GetUserActivityInput!) {
    usage: getUserActivity(input: $input) {
      id
      userId
      activity
      data
      ts
    }
  }
`;
