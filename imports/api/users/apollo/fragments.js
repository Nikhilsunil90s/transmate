import gql from "graphql-tag";

export const fragments = {
  userCore: gql`
    fragment userCore on User {
      id

      # projections:
      email
      name
      avatar
    }
  `,
  userPrefsAndSettings: gql`
    fragment userPrefsAndSettings on User {
      baseRoles
      roles
      entities

      preferences {
        views {
          shipments
        }
        picking {
          addressId
        }
      }
    }
  `
};
