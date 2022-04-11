import gql from "graphql-tag";
import { fragments as userFragments } from "/imports/api/users/apollo/fragments";

export const fragments = {
  accountBase: gql`
    fragment accountBase on AccountTypeD {
      id
      name
      type
      key
    }
  `,
  entities: gql`
    fragment entities on AccountTypeD {
      entities {
        code
        name
        address
        zipCode
        city
        country
        UID
        registrationNumber
        EORI
        VAT
        email
      }
    }
  `,
  accountAnnotation: gql`
    fragment accountAnnotation on AccountTypeD {
      annotation {
        profile
        coding
        notes {
          text
          date
        }
      }
    }
  `,
  accountProfile: gql`
    fragment accountProfile on AccountTypeD {
      # own profile
      description
      logo
      banner
      # FIXME double check this and remove the comment
      theme {
        colors
      }
    }
  `,
  users: gql`
    fragment users on AccountTypeD {
      users {
        ...userCore
        entities
        baseRoles
      }
    }
    ${userFragments.userCore}
  `
};

export const settingsFragments = {
  accountProfileBase: gql`
    fragment accountProfileBase on AccountTypeD {
      name
      type
      key
      description
      logo
      banner
      theme {
        colors
      }
      profile
    }
  `,
  projectSettings: gql`
    fragment projectSettings on AccountSettings {
      projectCodes {
        group
        code
        name
        lastActiveYear
      }
      projectYears
    }
  `,
  userBase: gql`
    fragment userBase on User {
      id
      profile {
        first
        last
        apiKey
        avatar
      }
    }
  `,
  userPrefs: gql`
    fragment userPrefs on User {
      preferences {
        notifications {
          group
          subGroup
          mail
          app
        }
      }
    }
  `
};
