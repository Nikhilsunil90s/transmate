import gql from "graphql-tag";

export const fragments = {
  documentBase: gql`
    fragment documentBase on DocumentType {
      id
      accountId
      icon
      id
      added {
        at
        by
      }
      meta {
        name
        lastModifiedDate
        size
        type
      }
      store {
        bucket
        key
        region
        service
      }
      type
      url
    }
  `,
  documentMinimal: gql`
    fragment documentMinimal on DocumentType {
      id
      type
      meta {
        name
        type
      }
      created {
        by
        at
      }
      # projected:
      icon
      url
    }
  `
};
