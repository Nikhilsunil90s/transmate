import gql from "graphql-tag";

export const fragments = {
  nonConformanceBase: gql`
    fragment nonConformanceBase on NonConformance {
      id
      reasonCode {
        event
        reason
        owner
        occurance
      }
      comment
      date
      status
      description
      created {
        by
        at
      }
    }
  `
};
