import gql from "graphql-tag";
import { fragments as toolsFragments } from "/imports/api/tools/apollo/fragments";

export const GET_ROUTE_INSIGHTS = gql`
  mutation getRouteInsights($input: GetRouteInsightsInput!) {
    insights: getRouteInsights(input: $input) {
      air {
        ...result
      }
      road {
        ...result
      }
      sea {
        ...result
      }
    }
  }
  ${toolsFragments.result}
`;

export const GET_USAGE = gql`
  query getUserActivityRouteInsights($input: GetUserActivityInput!) {
    usage: getUserActivity(input: $input) {
      id
      userId
      activity
      data
      ts
    }
  }
`;
