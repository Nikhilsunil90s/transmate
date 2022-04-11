import gql from "graphql-tag";

export const fragments = {
  addressBase: gql`
    fragment addressBase on Address {
      id
      street
      number
      bus
      zip
      city
      state
      country
      countryCode
      timeZone
      location {
        lat
        lng
      }
      linkedAccountsCount
    }
  `,
  addressAnnotation: gql`
    fragment addressAnnotation on Address {
      annotation {
        id
        name
        partnerId
        coding {
          code
          vendorId
          ediId
          color
        }
        externalId
        notes

        safety {
          pbm
          instructions
        }
        type
        certificates
        hours
        contacts {
          type
          firstName
          lastName
          phone
          mail
          linkedId
          userId
          events {
            event
            timestamp
          }
        }
      }
    }
  `,
  addressOverviewItem: gql`
    fragment addressOverviewItem on Address {
      id
      name
      zip
      city
      street
      number
      bus
      countryCode
      country

      addressName
      addressLine
      addressFormatted
    }
  `
};
