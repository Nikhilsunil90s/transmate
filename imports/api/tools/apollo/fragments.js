import gql from "graphql-tag";

export const fragments = {
  result: gql`
    fragment result on RouteInsightResult {
      kg
      steps {
        CO2
        cost
        days
        from
        hours
        km
        mode
        to
        type
      }
      totalCO2
      totalCost
      totalHours
      totalKm
      totalLeadtime
      warnings
    }
  `,
  oceanDistanceResult: gql`
    fragment oceanDistanceResult on OceanDistance {
      confidence
      from
      km
      nm
      nodes
      ports {
        index
        km
        lat
        lng
        nm
        port
      }
      to
    }
  `
};
